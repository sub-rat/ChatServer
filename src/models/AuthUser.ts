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
    BelongsToMany,
    Default,
    HasMany
} from 'sequelize-typescript';
import {App} from "./App";

@Table
export class AuthUser extends Model {
    @HasMany(()=> App)
    appId: number

    name!: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    email!: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    firstName!: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    lastName?: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    middleName?: string;

    @AllowNull(false)
    @Column
    password: string


    @Default(false)
    @Column
    isAdmin: boolean

    @Default(true)
    @Column
    isVerified: boolean

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

export interface ILoginData {
    email: string;
    password: string;
}

export interface IRegisterData {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface IJWToken {
    token: string;
    firstName: string;
    lastName: string;
    email: string;
}