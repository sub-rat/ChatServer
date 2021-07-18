import {Body, Controller, Delete, Get, Header, Path, Post, Put, Response, Route, SuccessResponse, Tags} from "tsoa";
import {ValidateErrorJSON} from "../interface/validate_error_json.interface";
import {User} from "../models/User";
import {App} from "../models/App";
import {isUuid} from "uuidv4";
import {HttpRequestError} from "../utils/errors";

interface UserCreateParams {
    appId: string
    appUserId: number
    firstName: string,
    lastName: string,
    token?: string,
}

@Route("user")
@Tags("user")
export class UserController extends Controller {

    @Post()
    @Response<ValidateErrorJSON>(422, "Validation Failed")
    @SuccessResponse("200", "Saved user") // Custom success response
    public async createUser(
        @Body() body: UserCreateParams
    ): Promise<any> {
        let appId: number;
        if( body.appId && isUuid(body.appId) ) {
            let app = await App.getApplication(body.appId)
            if (!app) {
                return new HttpRequestError(404,"App Not Found")
            }
        appId = app.id
        }else {
            return new HttpRequestError(404,"App Not Found")
        }
        const user = new User()
        user.appId = appId;
        user.firstName = body.firstName;
        user.lastName = body.lastName;
        user.token = body.token;
        user.appUserId = body.appUserId;

        const existingUser = await User.findOne({ where:{
               appId : user.appId,
               appUserId: user.appUserId
            }});

        if(existingUser){
            existingUser.token = user.token;
            await existingUser.save();
            return existingUser;
        }
        return await user.save();
    }
    //
    // @Put()
    // @Response<ValidateErrorJSON>(422, "Validation Failed")
    // @SuccessResponse("200", "Updated") // Custom success response
    // public async updateUser(
    //     @Body() body: UserCreateParams
    // ): Promise<any> {
    //     return await ChatUser.update(body);
    // }

    @Get("{appId}")
    public async getUsers( @Path() appId: string ): Promise<any>{
        this.setStatus(200);
        return await User.findAll({
            where: {
                appId: (await App.findOne({ where: { applicationId: appId}})).id
            }
        });
    }

    @Delete("{id}")
    public async deleteUser( @Path() id: string ): Promise<any>{
        let a = await User.findOne({where:{id: id}})
        if(!a){
            return new HttpRequestError(404,"ChatUser Not Found" )
        }
        return await a.destroy();
    }

}