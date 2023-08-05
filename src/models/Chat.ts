import {
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    Model,
    Table,
    Column,
    DataType,
    Index,
    AllowNull, ForeignKey, BeforeCreate, AfterFind, AfterCreate, DefaultScope, BelongsTo
} from 'sequelize-typescript';
import {App} from "./App";
import {decodeData, decrypt, encrypt} from "../utils/encryption";
import {User} from "./User";
import {Room} from "./Room";
// @DefaultScope(() => ({
//     attributes: ['id', 'room', 'message', 'sender', 'createdAt', 'updatedAt']
// }))

@Table
export class Chat extends Model{

    @AllowNull(false)
    @ForeignKey(() => Room)
    @Column
    roomId!: number;

    @AllowNull(false)
    @Column(DataType.TEXT)
    message!: string;

    @AllowNull(false)
    @ForeignKey(() => User)
    @Column
    userId!: number;


    @BelongsTo(() => User)
    user:User

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
        }else if (instance != null) {
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

