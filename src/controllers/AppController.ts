import {Route, Post, Get, Delete,SuccessResponse, Body, Controller, Response, Path} from "tsoa";
import {App} from "../models/App";

interface AppCreateParams {
    name?: string
}

interface ValidateErrorJSON {
    message: "Validation failed";
    details: { [name: string]: unknown };
}

@Route("app")
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
            this.setStatus(404);
            return { message: "App Not Found" };
        }
        let data = await a.destroy();
        return data;
    }
}