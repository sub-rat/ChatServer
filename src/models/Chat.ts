import {
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    Model,
    Table,
    Column,
    DataType,
    Index,
    AllowNull, ForeignKey, BeforeCreate, AfterFind, AfterCreate, DefaultScope
} from 'sequelize-typescript';
import {App} from "./App";
import {decodeData, decrypt, encrypt} from "../utils/encryption";
@DefaultScope(() => ({
    attributes: ['id', 'room', 'message', 'sender', 'createdAt', 'updatedAt']
}))

@Table
export class Chat extends Model{

    @AllowNull(false)
    @Index
    @ForeignKey(() => App)
    @Column
    appId!: string;

    @AllowNull(false)
    @Index
    @Column
    room!: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    message!: string;


    @AllowNull(false)
    @Column(DataType.TEXT)
    sender!: string;

    @CreatedAt
    @Column
    createdAt!: Date;

    @UpdatedAt
    @Column
    updatedAt!: Date;

    @DeletedAt
    @Column
    deletedAt!: Date;

    @AfterFind
    static decryptData(instance: any){
        if (instance instanceof Chat){
            instance.message = decrypt(instance.message);
        }else {
            instance.forEach((chat: Chat) => {
                chat.message = decrypt(chat.message);
            });
        }
    }

    @AfterCreate
    static decryptCreateData(instance: any){
        instance.message = decrypt(instance.message);
    }
}

