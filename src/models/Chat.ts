import {
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    Model,
    Table,
    Column,
    DataType,
    Index,
    AllowNull, ForeignKey
} from 'sequelize-typescript';
import {App} from "./App";
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

}

