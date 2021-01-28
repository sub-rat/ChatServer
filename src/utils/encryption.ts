import { randomBytes, createCipheriv, createDecipheriv} from 'crypto';
import { encode, decode } from 'js-base64';
import * as dotenv from "dotenv";
dotenv.config();

const ALGORITHM = 'aes-256-cbc';
const ENCODING = 'hex';
const IV_LENGTH = 16;
const KEY = process.env.ENCRYPTION_KEY!;

export const encrypt = (data: string) => {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, new Buffer(KEY), iv,{});
    return Buffer.concat([cipher.update(data,), cipher.final(), iv]).toString(ENCODING);
}

export const decrypt = (data: string) => {
    const binaryData = new Buffer(data, ENCODING);
    const iv = binaryData.slice(-IV_LENGTH);
    const encryptedData = binaryData.slice(0, binaryData.length - IV_LENGTH);
    const decipher = createDecipheriv(ALGORITHM, new Buffer(KEY), iv);
    return Buffer.concat([decipher.update(encryptedData), decipher.final()]).toString();
}

export const encodeData = (data: string) => {
    return encode(data);
}

export const decodeData = (data: string) => {
    return decode(data);
}
