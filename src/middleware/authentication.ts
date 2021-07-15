import * as express from "express";
import * as jwt from "jsonwebtoken";
const secret = process.env.JWT_SECRET || 'my@#$secret';

export function expressAuthentication(
    request: express.Request,
    securityName: string,
    scopes?: string[]
): Promise<any> {
    if (securityName === "api_key") {
        return Promise.reject('Not supported authentication type');
    }

    if (securityName === "jwt") {
        const token =
            request.body.token ||
            request.query.token ||
            request.headers["authorization"];

        return new Promise((resolve, reject) => {
            if (!token) {
                reject(new Error("No token provided"));
            }
            jwt.verify(token, secret, function (err: any, decoded: any) {
                if (err) {
                    reject(err);
                } else {
                    console.log(scopes);
                    console.log(decoded)
                    // Check if JWT contains all required scopes
                    for (let scope of decoded.scopes) {
                        if (!scopes.includes(scope)) {
                            reject(new Error("JWT does not contain required scope."));
                        }
                    }
                    resolve(decoded);
                }
            });
        });
    }

    return Promise.reject({})
}