import {Route, Post, Get, Delete, SuccessResponse, Body, Controller, Response, Path, Tags, Security} from "tsoa";
import {App} from "../models/App";
import {ValidateErrorJSON} from "../interface/validate_error_json.interface";
import {HttpRequestError} from "../utils/errors";
import {isUuid} from "uuidv4";

interface AppCreateParams {
    name?: string
}


@Route("app")
@Tags("app")
@Security("jwt",['admin','user'])
export class AppController extends Controller{

    @Post()
    @Response<ValidateErrorJSON>(422, "Validation Failed")
    @SuccessResponse("201", "Created") // Custom success response
    public async createApp(
        @Body() body: AppCreateParams
    ): Promise<any> {
        let data = await App.create(body);
        return data;
    }

    @Get()
    public async getApp(): Promise<any>{
        this.setStatus(200);
        let data = await App.findAll();
        return data;
    }

    @Delete("{appId}")
    public async deleteApp( @Path() appId: string ): Promise<any>{
        let a = await App.findOne({where:{id: appId}})
        if(!a){
           return new HttpRequestError(404, "App Not Found")
        }
        let data = await a.destroy();
        return data;
    }

    static async getAppID(appId: string){
        if( appId && isUuid(appId)) {
            let app: App = await App.getApplication(appId);
            if (!app) {
                throw new HttpRequestError(404,"App Not Found")
            }
            return app.id
        }else {
            throw new HttpRequestError(404,"App Not Found")
        }
    }
}