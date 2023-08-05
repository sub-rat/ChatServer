import {Body, Controller, Delete, Get, Header, Path, Post, Put, Response, Route, SuccessResponse, Tags} from "tsoa";
import {ValidateErrorJSON} from "../interface/validate_error_json.interface";
import {User} from "../models/User";
import {Op} from "sequelize";
import {Room} from "../models/Room";
import {RoomUser} from "../models/RoomUser";
import {HttpRequestError} from "../utils/errors";
import {AppController} from "./AppController";

interface RoomCreateParams {
    room: string
    appId?: string
    users?: number[]
    extra?: object
}

interface RoomCheckParams {
    appId: string
    users: number[]
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
        const roomEntity = await Room.create({room: body.room, appId: appId, extra: body.extra});
        for (const u of users) {
            await RoomUser.create({ roomId: roomEntity.id, userId: u.id });
        }
        return Room.findByPk(roomEntity.id, { include: ['users'] });
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

    @Get('/my_room')
    public async getRoomsByToken( @Header('token') token: string): Promise<any>{
        try {
            let user = await Room.findAll({include: {model : User,  where:{token: token}} , attributes:['id', 'room']});
            if (user){
                let uList:Array<number> = [];
                user.forEach((item)=> {
                    uList.push(item.id)
                });
                let room = Room.findAll({where: {id: {[Op.in]: uList}}, include: {model : User}})
                this.setStatus(200);
                return room
            }
            this.setStatus(200);
            return []
        }catch (e) {
            return e
        }

    }

    @Post('/check_room')
    public async checkRoom(@Body() body: RoomCheckParams): Promise<any>{
        let aId: number;
        try {
            aId = await AppController.getAppID(body.appId)
        }catch (e) {
            return e
        }
        this.setStatus(200);

        const roomExists = (await Room.findAll({
            where: {
                appId: aId,
                '$users.appUserId$': { [Op.in]: body.users, }
            },
            include: [{
                model: User,
                as: 'users'
            }]
        })).filter((item: Room) => {
            if (item.users.length === body.users.length) {
                return item;
            }
        });

        if (roomExists && roomExists.length > 0) {
           return roomExists[0] ?? {};

        } else {
            this.setStatus(404);
            return new HttpRequestError(404, "Room Not Found")
        }
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
        appId = await AppController.getAppID(body.appId)

        const room = await Room.findOne({where:{room: body.room, appId: appId}});
        if(!room){
            return new HttpRequestError(404,"Room Not Found")
        }
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

            let roomUser = await RoomUser.findOne({where: {
                    roomId: room.id,
                    userId: u.id
                }, paranoid: false});
            if (!roomUser){
                await RoomUser.create({
                        roomId: room.id,
                        userId: u.id
                    });
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
        const room = await Room.findOne({where:{room: body.room , appId: aId}});
        if(!room){
            return new HttpRequestError(404,"Room Not Found")
        }
        const users = await User.findAll({
            where: {
                appId: aId,
                appUserId: {
                    [Op.in]: body.users,
                }
            }
        });
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