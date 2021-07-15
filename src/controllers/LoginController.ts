import {Tags, Route, Controller, Post, Body, SuccessResponse, Response, Security, Get, Header} from 'tsoa';
import { LoginService } from '../service/login.service';
import {AuthUser, IJWToken, ILoginData, IRegisterData} from '../models/AuthUser';

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
    @Response('401', 'Unathorized')
    @Post('/register')
    public async registerUser(@Body() requestBody: IRegisterData): Promise< IJWToken | null | {}> {
        const user = await AuthUser.findOne({ where: { email: requestBody.email } });
        if(user){
            this.setStatus(400);
            return { message: 'ChatUser Already Exists'}
        }
        return LoginService
            .registerUser(requestBody)
            .then((result) => {
                if (result) {
                    return result;
                } else {
                    this.setStatus(401);
                    return {name: 'InvalidRegister', message: 'Register failed'};
                }
            })
            .catch((err) => err);
    }

    @Get("/verify")
    public verifyUser(@Header() token: string){
        return token === 'abcdefg';
    }
}