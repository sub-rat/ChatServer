import {
    AllowNull,
    BelongsTo,
    Column,
    CreatedAt,
    DefaultScope,
    DeletedAt,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt
} from "sequelize-typescript";
import {User} from "./User";
import {Room} from "./Room";
import {Chat} from "./Chat";

@Table
export class RoomUser extends Model {

    @ForeignKey(() => User)
    @Column
    userId: number

    @BelongsTo(() => User)
    user: User

    @ForeignKey(() => Room)
    @Column
    roomId: number

    @BelongsTo(() => Room)
    room: User

    @ForeignKey(() => Chat)
    @AllowNull
    @Column
    chatId: number


    @CreatedAt
    @Column
    createdAt!: Date;

    @UpdatedAt
    @Column
    updatedAt!: Date;

    @DeletedAt
    @Column
    deletedAt!: Date;
}