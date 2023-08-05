import * as https from 'https';

export const verifyUserToken = ({ verifyUrl, token }: { verifyUrl: string, token: string }): Promise<Boolean> => {
    return new Promise((resolve, reject) => {
        https.get(`${verifyUrl}?token=${token}`, (res: any) => {
            let message = '';

            res.on('data', (chunk: any) => {
                message += chunk;
            });
            res.on('end', () => {
                console.log(message);
                resolve(true);
            });
        })
        .on('error', (error: any) => {
            console.log(error);
            reject(false);
        });
    });
}