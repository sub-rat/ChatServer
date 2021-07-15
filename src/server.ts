// src/server.ts

import { ChatServer } from './ChatServer';
import {RegisterRoutes} from "./routes/routes";
import  {
    Response as ExResponse,
    Request as ExRequest,
    NextFunction,
} from "express";
const AdminBro = require('admin-bro')
const AdminBroExpress = require('@admin-bro/express')
const AdminBroSequelize = require('@admin-bro/sequelize')
AdminBro.registerAdapter(AdminBroSequelize)
import {JsonWebTokenError} from "jsonwebtoken";
import {AuthUser} from "./models/AuthUser";
import {App} from "./models/App";
import {Room} from "./models/Room";
import {RoomUser} from "./models/RoomUser";
import {User} from "./models/User";
import {Chat} from "./models/Chat";
import {LoginService} from "./service/login.service";
import {DatabaseError} from "sequelize";
import {ValidationError} from "admin-bro";


// const db = require('./models');
const contentNavigation = {
    name: 'Models ',
    icon: 'Accessibility',
}
const adminBro = new AdminBro({
    resources: [
        { resource: AuthUser, options: { navigation: contentNavigation}},
        { resource: App, options: { navigation: contentNavigation}},
        { resource: Room, options: { navigation: contentNavigation}},
        { resource: RoomUser, options: {
            navigation: contentNavigation,
                properties: {
                    roomId: { isVisible: true, show: true, edit: true, filter: true },
                    userId: { isVisible: true, show: true, edit: true, filter: true }
                }
        }},
        { resource: User, options: { navigation: contentNavigation}},
        { resource: Chat, options: { navigation: contentNavigation}}],
    rootPath: '/admin',
    branding: {
        companyName: 'Chat Api'
    }
});

const router = AdminBroExpress.buildAuthenticatedRouter(adminBro,{
    authenticate: async (email: string, password: string) => {
        const user = await AuthUser.findOne({where: { email: email}})
        if (user && LoginService.comparePassword(user.password, password)) {
                return user;
        }
        return false;
    },
    cookiePassword: 'session Key'
})
let app
app = new ChatServer(adminBro, router).app;
RegisterRoutes(app);
// app.use(adminBro.options.rootPath, router)
app.use(function notFoundHandler(_req, res: ExResponse) {
    res.status(404).send({
        message: "Not Found",
    });
});

app.use(function errorHandler(
    err: unknown,
    req: ExRequest,
    res: ExResponse,
    next: NextFunction
): ExResponse | void {
    if (err instanceof JsonWebTokenError) {
        return res.status(400).json({
            message: err?.message ? err.message : "Internal Server Error"
        });
    }else if ( err instanceof DatabaseError) {
        return res.status(400).json({
            message: err?.message ? err.message : "Something went wrong"
        });
    }else if (err instanceof Error) {
        return res.status(500).json({
            error : err.message ? err : err.fields ? err.fields :"Internal Server Error",
        });
    }

    next();
});

export { app };


