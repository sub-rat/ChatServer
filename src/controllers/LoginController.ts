import {Tags, Route, Controller, Post, Body, SuccessResponse, Response, Security, Get, Header} from 'tsoa';
import { LoginService } from '../service/login.service';
import {AuthUser, IJWToken, ILoginData, IRegisterData} from '../models/AuthUser';
import {HttpRequestError} from "../utils/errors";

@Route('auth')
@Tags('auth')
export class LoginController extends Controller {

    /**
     * Login user
     *
     * @summary Login user
     *
     * @param requestBody
     */
    @SuccessResponse('200', 'OK')
    @Response('401', 'Unathorized')
    @Post('/login')
    public async loginUser(@Body() requestBody: ILoginData): Promise< IJWToken | null > {
        return LoginService
            .loginUser(requestBody.email, requestBody.password)
            .then((result) => {
                if (result) {
                    return result;
                } else {
                    this.setStatus(401);
                    return {name: 'InvalidLogin', message: 'Login failed'};
                }
            })
            .catch((err) => err);
    }


    /**
     * Register user
     *
     * @summary Register user
     *
     * @param requestBody
     */
    @SuccessResponse('201', 'OK')
    @Security('jwt',['admin'])
    @Header("content-type: application/json")
    @Post('/register')
    public async registerUser(@Body() requestBody: IRegisterData): Promise< IJWToken | null | {}> {
        const user = await AuthUser.findOne({ where: { email: requestBody.email } });
        if(user){
            return new HttpRequestError(400, 'ChatUser Already Exists')
        }
        return LoginService
            .registerUser(requestBody)
            .then((result) => {
                if (result) {
                    return result;
                } else {
                   return new HttpRequestError(401,"Register failed")
                }
            })
            .catch((err) => new HttpRequestError(err.statusCode, err.message));
    }

    @Get("/verify")
    public verifyUser(@Header() token: string){
        return token === 'abcdefg';
    }
}