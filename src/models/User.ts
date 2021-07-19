import {
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    Model,
    Table,
    Column,
    DataType,
    Index,
    AllowNull, ForeignKey, BeforeCreate, AfterFind, AfterCreate, DefaultScope, BelongsTo, BelongsToMany
} from 'sequelize-typescript';
import {App} from "./App";
import {Room} from "./Room";
import {RoomUser} from "./RoomUser";
// @DefaultScope(() => ({
//     attributes: ['userId','firstName', 'lastName', 'token', 'createdAt', 'updatedAt']
// }))

@Table
export class User extends Model {
    @ForeignKey(()=> App)
    @Column
    appId: number

    @BelongsTo(() => App)
    app:App

    @BelongsToMany(()=> Room, () => RoomUser)
    room: Room

    @AllowNull(false)
    @Column(DataType.TEXT)
    firstName!: string;

    @AllowNull(false)
    @Column
    appUserId!: number;

    @AllowNull(false)
    @Column(DataType.TEXT)
    lastName!: string;


    @AllowNull(true)
    @Column(DataType.TEXT)
    middleName?: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    token: string;

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