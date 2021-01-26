// src/server.ts

import { ChatServer } from './ChatServer';
import {RegisterRoutes} from "./routes/routes";
import  {
    Response as ExResponse,
    Request as ExRequest,
    NextFunction,
} from "express";
import {ValidateError} from "@tsoa/runtime";
let app
app = new ChatServer().app;
RegisterRoutes(app);
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
    if (err instanceof Error) {
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }

    next();
});

export { app };


