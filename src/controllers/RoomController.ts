import {Body, Controller, Delete, Get, Header, Path, Post, Put, Response, Route, SuccessResponse, Tags} from "tsoa";
import {ValidateErrorJSON} from "../interface/validate_error_json.interface";
import {User} from "../models/User";
import {Op} from "sequelize";
import {Room} from "../models/Room";
import {RoomUser} from "../models/RoomUser";
import {HttpRequestError} from "../utils/errors";
import {AppController} from "./AppController";
import {app} from "../server";

interface RoomCreateParams {
    room: string
    appId?: string
    users?: number[]
}

@Route("room")
@Tags("room")
export class RoomController extends Controller {

    @Post()
    @Response<ValidateErrorJSON>(422, "Validation Failed")
    @SuccessResponse("200", "Saved user") // Custom success response
    public async createRoom(
        @Body() body: RoomCreateParams
    ): Promise<any> {
        let appId: number;
        try {
            appId = await  AppController.getAppID(body.appId)
        }catch (e) {
            return e
        }

        const existingRoom = await Room.findOne({where: { appId: appId, room: body.room}})
        if (existingRoom){
            return new HttpRequestError(400,"Room Already Exists")
        }
        const users = await User.findAll({
            where: {
                appId: appId,
                appUserId: {
                    [Op.in]: body.users,
                }
            }
        });
        console.log(users);
        if (users && users.length != body.users.length){
            const unknownUsers: number[] = [];
            body.users.forEach((item) => {
                if (users.map((user) => user.appUserId).indexOf(item) === -1 ){
                    unknownUsers.push(item);
                }
            })
            return new HttpRequestError(400, "Users "+ unknownUsers.toString() + " not registered")
        }
        return await Room.create({room: body.room, appId: appId, users: users});
    }

    @Get()
    public async getRooms( @Header('appId') appId: string): Promise<any>{
        let aId: number;
        try {
            aId = await AppController.getAppID(appId)
        }catch (e) {
            return e
        }
        this.setStatus(200);
        return await Room.findAll({ where: { appId: aId }});
    }

    @Get('{room}')
    public async getRoomsByName(@Path() room: string, @Header('appId') appId: string): Promise<any>{
        let aId: number;
        try {
            aId = await AppController.getAppID(appId)
        }catch (e) {
            return e
        }
        this.setStatus(200);
        let data = await Room.findOne({where:{room:room , appId: aId }, include: { model: User }});
        console.log(data.users);
        return  data;

    }

    @Put('/add')
    @Response<ValidateErrorJSON>(422, "Validation Failed")
    @SuccessResponse("200", "Updated") // Custom success response
    public async addUser(
        @Body() body: RoomCreateParams
    ): Promise<any> {
        let appId: number;
        appId = await  AppController.getAppID(body.appId)
        const users = [];
        for (const id of body.users) {
            let u = await User.findOne({
                where: {
                    appId: appId,
                    appUserId: id
                }
            });
            if(!u){
                return new HttpRequestError(404,"ChatUser id " + id + " Not Found")
            }
            users.push(u);
        }

        const room = await Room.findOne({where:{room: body.room, appId: appId}});
        if(!room){
            return new HttpRequestError(404,"Room Not Found")
        }
        for (const u of users) {
            let roomUser = await RoomUser.findOne({where: {
                    roomId: room.id,
                    userId: u.id
                }, paranoid: false});
            if (!roomUser){
                await RoomUser.create({where: {
                        roomId: room.id,
                        userId: u.id
                    }});
            }else if (roomUser.deletedAt != null){
                await roomUser.restore();
            }
        }
        return { message: "updated"}
    }

    @Put('/remove')
    @Response<ValidateErrorJSON>(422, "Validation Failed")
    @SuccessResponse("200", "Updated") // Custom success response
    public async removeUser(
        @Body() body: RoomCreateParams
    ): Promise<any> {
        let aId: number;
        try {
            aId = await AppController.getAppID(body.appId)
        }catch (e) {
            return e
        }
        const users = await User.findAll({
            where: {
                appId: aId,
                appUserId: {
                    [Op.in]: body.users,
                }
            }
        });
        const room = await Room.findOne({where:{room: body.room , appId: aId}});
        if(!room){
            return new HttpRequestError(404,"Room Not Found")
        }
        users.forEach((u) => {
            RoomUser.destroy({ where: {
                    roomId: room.id,
                    userId: u.id
                }});
        });
        return { message: "updated"}
    }

    @Delete("{id}")
    public async deleteRoom( @Path() id: string , @Header('appId') appId: string): Promise<any>{
        let aId: number;
        try {
            aId = await AppController.getAppID(appId)
        }catch (e) {
            return e
        }
        let a = await Room.findOne({where:{id: id, appId: aId}})
        if(!a){
            return new HttpRequestError(404,"ChatUser Not Found")
        }
        return await a.destroy();
    }

}