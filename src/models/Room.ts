import {
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    Model,
    Table,
    Column,
    DataType,
    Index,
    AllowNull,
    ForeignKey,
    BeforeCreate,
    AfterFind,
    AfterCreate,
    DefaultScope,
    BelongsTo,
    HasMany,
    BelongsToMany,
    Default
} from 'sequelize-typescript';
import {App} from "./App";
import {User} from "./User";
import {RoomUser} from "./RoomUser"
import {DataTypes} from "sequelize";
// @DefaultScope(() => ({
//     attributes: ['id', 'room', 'createdAt', 'updatedAt']
// }))

@Table
export class Room extends Model {
    @ForeignKey(()=> App)
    @Column
    appId!: number

    @BelongsTo(() => App)
    app:App

    @AllowNull(false)
    @Index
    @Column
    room!: string;

    @BelongsToMany(() => User, ()=> RoomUser)
    users: User[]

    @Default({})
    @Column(DataTypes.JSON)
    extra: JSON;

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