import * as express from 'express';
// import * as socketIo from 'socket.io';
import { ChatEvent } from './constants';
import {ChatMessage, ChatMessageServer, Pagination, UpdateMessage} from './types';
import { createServer, Server as HttpServer } from 'http';
import { Server, Socket } from "socket.io";
import sequelize from "./sequelize";
import {Chat} from "./models/Chat";
import {User} from "./models/User";
const swaggerUi = require('swagger-ui-express');
import * as dotenv from "dotenv";
import {encodeData, encrypt} from "./utils/encryption";
import {AuthUser} from "./models/AuthUser";
import {LoginService} from "./service/login.service";
import AdminBro from "admin-bro";
import {App} from "./models/App";
import {Room} from "./models/Room";
import {RoomUser} from "./models/RoomUser";
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users')
dotenv.config();

const cors = require('cors');
const bodyParser = require('body-parser');

export class ChatServer {
  public static readonly PORT: number = 8080;
  private readonly _app: express.Application;
  private readonly server: HttpServer;
  private io: Server;
  private readonly port: string | number;

  constructor (adminBro: AdminBro, router: any) {
    this._app = express();
    this.port = process.env.PORT || ChatServer.PORT;
    this._app.use(cors());
    this._app.options('*', cors());
    this._app.use(adminBro.options.rootPath, router)
    this._app.use(bodyParser.json());
    this._app.use(bodyParser.urlencoded({ extended : true }));
    this.server = createServer(this._app);
    this.initSocket();
    this.startSwagger();
    this.listen();
  }

  private initSocket (): void {
    this.io = new Server(this.server,{
      cors: {
        origin: "*"
      }
    })
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
    await sequelize.sync({alter: true}).then(async ()=>{
     let user = await AuthUser.findOne({ where: {
            email: 'chat@ayaanshtech.com',
      }});
     if(!user){
       await AuthUser.create({
           firstName: 'Admin',
           lastName: 'Admin',
           email: 'chat@ayaanshtech.com',
           password: LoginService.hashPassword('Admin@2020'),
           isVerified: true,
           isAdmin: true
         });
     }
    });
  }

  private listen (): void {
    this.startPostgres().then(r => {
      this.server.listen(this.port, () => {
        console.log('Running server on port %s', this.port);
      });

      this.io.use(async (socket,next) => {
        console.log("socket connection established");
        let token = socket.handshake.query["token"]
        if (token){
          let user = await User.findOne({where:{token: token}, include: App});
          if (user){
            // axios.user.app.verifyUrl
            socket.data = user
            return next();
          }else{
            return next(new Error("token key mismatch"));
          }
        }else{
          return next( new Error("No token key found"));
        }
      }).on(ChatEvent.CONNECT,(socket: Socket) => {
        console.log('Connected client on port %s.', this.port);

        socket.on(ChatEvent.JOIN_ROOM, async (room: string) => {
          if(room) {
            const roomData = await Room.findOne({where: { room: room}, include: { model: User , where: { id: socket.data.id}}})
            if (roomData) {
              const {error, user} = addUser({
                appId: roomData.appId,
                room: roomData.room,
                roomId: roomData.id,
                sender: socket.data.id,
                id: socket.id
              })

              if (error) {
                return error;
              }
              socket.join(user.room)
              socket.emit(ChatEvent.INFO, "You have joined the room")
              socket.broadcast.to(user.room).emit(ChatEvent.INFO, `${user.sender} has joined!`);
              const latestChat = await Chat.findOne({where: { roomId: roomData.id }, order: [['id', 'DESC']]});
              if (latestChat) {
                await RoomUser.update({chatId: latestChat.id}, {where: {roomId: roomData.id, userId: socket.data.id}})
              }
              this.io.to(user.room).emit(ChatEvent.ROOM_DATA, {
              room: user.room,
              users: getUserInRoom(user.room)
            })
            }
          }
        })

        socket.on('typing', (typing: boolean) => {
          const user = getUser(socket.id);
          if(typing) {
            this.io.to(user.room).emit('is_typing', socket.data);
          }
        })

        socket.on('seen', async () => {
          const user = getUser(socket.id);
          if(user) {
            const latestChat = await Chat.findOne({where: { roomId: user.roomId }, order: [['id', 'DESC']]});
            await RoomUser.update({chatId: latestChat.id}, {where: { roomId: user.roomId , userId: user.sender}})
            this.io.to(user.room).emit('seen_by', socket.data);
          }
        })

        socket.on(ChatEvent.LEAVE_ROOM, () => {
          const user = removeUser(socket.id);
          if (user) {
            this.io.to(user.room).emit(ChatEvent.INFO,`${user.sender} has left`);
            this.io.to(user.room).emit(ChatEvent.ROOM_DATA, {
              room: user.room,
              users: getUserInRoom(user.room)
            })
            socket.leave(user.room);
          }
        })

        socket.on(ChatEvent.SEND_MESSAGE, async (m: string) => {
          const user = getUser(socket.id);
          if (m && user) {
            console.log('[server](message): %s', JSON.stringify(m));
            let data: ChatMessageServer = {
              roomId: user.room,
              message: encrypt(encodeData(m)),
              userId: user.sender
            };
            let message = await Chat.create(data);
            if (message) {
              this.io.to(user.room).emit(ChatEvent.MESSAGE, message)
            }
          }else {
            socket.emit(ChatEvent.ERROR,"No message or sender");
          }
        });

        socket.on(ChatEvent.LOAD_MORE,  async (p : Pagination)=>{
          const user = getUser(socket.id);
          if (user && user.room) {
            let pagination: Pagination = {limit: 20, page: 1};
            if (p.page) {
              pagination.page = p.page;
            }
            if (p.limit) {
              pagination.limit = p.limit;
            }
            if (pagination.page < 1) {
              pagination.page = 1
            }
            let data = await Chat.findAll(
                {
                  where: {
                    roomId: user.roomId
                  },
                  order: [
                    ['id', 'DESC'],
                  ],
                  attributes: ['id', 'message', 'sender', 'createdAt', 'updatedAt'],
                  limit: pagination.limit,
                  offset: (pagination.page - 1) * pagination.limit,
                  raw: true,
                  nest: true
                });
            console.log(data);
            socket.emit(ChatEvent.LOAD_MORE, data);
          }
        });

        socket.on(ChatEvent.UPDATE, async (update: UpdateMessage) => {
          const user = getUser(socket.id);
          if (update.id && user) {
            Chat.findOne({where:{
                id: update.id,
                userId : user.sender,
                roomId : user.roomId
              }}).then( chat => {
              chat.message = encrypt(encodeData(update.message));
              chat.save();
              this.io.to(user.room).emit(ChatEvent.MESSAGE, chat);
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
              socket.to(user.room).emit(ChatEvent.DELETE_MESSAGE,chat);
            }).catch( error => {
              socket.emit(ChatEvent.ERROR,error);
            })
          }else {
            socket.emit(ChatEvent.ERROR,"Sender not found");
          }
        });

        // socket.on(ChatEvent.DELETE_CHAT, async (room : string) => {
        //    let d =  await Chat.destroy({ where:{
        //         room : room, appId: socket.handshake.query["appKey"],
        //       }});
        //    if (d){
        //      socket.emit("Room Deleted");
        //    }
        //   socket.emit(ChatEvent.ERROR,"Room Not Found");
        // });

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
