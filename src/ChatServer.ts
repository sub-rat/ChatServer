import * as express from 'express';
import * as socketIo from 'socket.io';
import { ChatEvent } from './constants';
import {ChatMessage, ChatMessageServer, JoinRoom, Pagination, UpdateMessage, User} from './types';
import { createServer, Server } from 'http';
import * as SocketIO from "socket.io";
import sequelize from "./sequelize";
import {Chat} from "./models/Chat";
import {App} from "./models/App";
const swaggerUi = require('swagger-ui-express');
import * as dotenv from "dotenv";
import {encodeData, encrypt} from "./utils/encryption";
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users')
dotenv.config();

const cors = require('cors');
const bodyParser = require('body-parser');

export class ChatServer {
  public static readonly PORT: number = 8080;
  private readonly _app: express.Application;
  private readonly server: Server;
  private io: SocketIO.Server;
  private readonly port: string | number;

  constructor () {
    this._app = express();
    this.port = process.env.PORT || ChatServer.PORT;
    this._app.use(cors());
    this._app.options('*', cors());
    this._app.use(bodyParser.json());
    this._app.use(bodyParser.urlencoded({ extended : true }));
    this.server = createServer(this._app);
    this.initSocket();
    this.startSwagger();
    this.listen();
  }

  private initSocket (): void {
    this.io = socketIo(this.server, {
      handlePreflightRequest: (req, res) => {
        const headers = {
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
          "Access-Control-Allow-Credentials": true
        };
        // @ts-ignore
        res.writeHead(200, headers);
        res.end();
      }
    });
  }

  /**
   * start swagger-ui express server and setup the documentation to be served
   */
  private startSwagger(): void {
    try {
      const swaggerDoc = require('../build/swagger.json');
      this._app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
    } catch (error) {
      console.log(error);
    }
  }


  async startPostgres() {
    await sequelize.sync({alter: true});
  }

  private listen (): void {
    this.startPostgres().then(r => {
      this.server.listen(this.port, () => {
        console.log('Running server on port %s', this.port);
      });

      this.io.use(async (socket,next) => {
        let appKey = socket.handshake.query["appKey"]
        if (appKey){
          let id = await App.findOne({where:{id: appKey}});
          if (id){
            return next();
          }else{
            return next(new Error("App key mismatch"));
          }
        }else{
          return next( new Error("No App key found"));
        }
      }).on(ChatEvent.CONNECT, (socket: any) => {
        console.log('Connected client on port %s.', this.port);

        socket.on(ChatEvent.JOIN_ROOM, (joinRoom: JoinRoom) => {
          const { error, user } = addUser({
            appId: socket.handshake.query["appKey"],
            room: joinRoom.roomId,
            sender: encodeData(joinRoom.sender),
            id: socket.id
          })

          if (error) {
            return error;
          }
          socket.join(user.room)
          socket.emit(ChatEvent.INFO, "You have joined the room")
          socket.broadcast.to(user.room).emit(ChatEvent.INFO, `${user.sender} has joined!`);

          this.io.to(user.room).emit(ChatEvent.ROOM_DATA, {
            room: user.room,
            users: getUserInRoom(user.room)
          })
        })

        socket.on(ChatEvent.LEAVE_ROOM, () => {
          const user = removeUser(socket.id);
          socket.leave(user.room);
          if (user) {
            this.io.to(user.room).emit(ChatEvent.INFO,`${user.sender} has left`);
            this.io.to(user.room).emit(ChatEvent.ROOM_DATA, {
              room: user.room,
              users: getUserInRoom(user.room)
            })
          }
        })

        socket.on(ChatEvent.SEND_MESSAGE, async (m: string) => {
          const user = getUser(socket.id);
          if (m && user) {
            console.log('[server](message): %s', JSON.stringify(m));
            let data: ChatMessageServer = {
              appId: user.appId,
              room: user.room,
              message: encrypt(encodeData(m)),
              sender: user.sender
            };
            let message = await Chat.create(data);
            if (message) {
              this.io.to(message.room).emit(ChatEvent.MESSAGE, {
                id:message.id,
                room:message.room,
                message:message.message,
                sender:message.sender,
                updatedAt:message.updatedAt,
                createdAt:message.createdAt});
            }
          }else {
            socket.emit(ChatEvent.ERROR,"No message or sender");
          }
        });

        socket.on(ChatEvent.LOAD_MORE,  async (p : Pagination)=>{
          const user = getUser(socket.id);
          let pagination :Pagination = { limit : 20 , page: 1};
          if ( p.page){
            pagination.page = p.page;
          }
          if (p.limit){
            pagination.limit = p.limit;
          }
          if (pagination.page < 1) {
            pagination.page = 1
          }
          let data = await Chat.findAll(
              {
                where: {
                  room: user.room,
                  appId: user.appId
                },
                attributes: ['id','message', 'sender', 'createdAt', 'updatedAt'],
                limit: pagination.limit,
                offset: (pagination.page-1) * pagination.limit,
                raw: true,
                nest: true
              });
          console.log(data);
          socket.emit(ChatEvent.LOAD_MORE,data);
        });

        socket.on(ChatEvent.UPDATE, async (update: UpdateMessage) => {
          const user = getUser(socket.id);
          if (update.id && user) {
            Chat.findOne({where:{
                id: update.id,
                sender : user.sender,
                appId : user.appId
              }}).then( chat => {
              chat.message = encrypt(encodeData(update.message));
              chat.save();
              this.io.to(chat.room).emit(ChatEvent.MESSAGE, chat);
            }).catch( error => {
              socket.emit(ChatEvent.ERROR,error);
            })
          }else {
            socket.emit(ChatEvent.ERROR,"Sender not found");
          }
        });

        socket.on(ChatEvent.DELETE_MESSAGE, async (id: number) => {
          const user = getUser(socket.id);
          if (user) {
            Chat.findOne({where:{
                id: id,
                sender :  user.sender,
              }}).then( chat => {
              chat.destroy();
              socket.to(chat.room).emit(ChatEvent.DELETE_MESSAGE,chat);
            }).catch( error => {
              socket.emit(ChatEvent.ERROR,error);
            })
          }else {
            socket.emit(ChatEvent.ERROR,"Sender not found");
          }
        });

        socket.on(ChatEvent.DELETE_CHAT, async (room : string) => {
           let d =  await Chat.destroy({ where:{
                room : room, appId: socket.handshake.query["appKey"],
              }});
           if (d){
             socket.emit("Room Deleted");
           }
          socket.emit(ChatEvent.ERROR,"Room Not Found");
        });

        socket.on(ChatEvent.DISCONNECT, () => {
          const user = removeUser(socket.id);
          console.log(user)
          if (user) {
            this.io.to(user.room).emit(ChatEvent.INFO,`${user.sender} has left`);
            this.io.to(user.room).emit("roomData", {
              room: user.room,
              users: getUserInRoom(user.room)
            })
            socket.leave(user.room);
          }
        });
      });
    });
  }

  get app (): express.Application {
    return this._app;
  }
}
