import {
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    Model,
    Table,
    Column,
    DataType,
    Index,
    AllowNull, IsUUID, PrimaryKey, AutoIncrement, BeforeCreate, Unique, ForeignKey, BelongsTo
} from 'sequelize-typescript';
import {AuthUser} from "./AuthUser";
const { uuid } = require('uuidv4');

@Table
export class App extends Model{

    @IsUUID(4)
    @Unique
    @Column(DataType.UUID)
    applicationId: string;

    @BeforeCreate
    static generateUUidV4(instance: App) {
        instance.applicationId = uuid();
    }

    @AllowNull(false)
    @Column
    name!: string;

    @AllowNull(true)
    @Column
    verifyUrl!: string;

    @ForeignKey(()=> AuthUser)
    @Column
    authUserId: number;

    @BelongsTo(()=> AuthUser)
    authUser: AuthUser

    @CreatedAt
    @Column
    createdAt!: Date;

    @UpdatedAt
    @Column
    updatedAt!: Date;

    @DeletedAt
    @Column
    deletedAt!: Date;

    static async getApplication(appId: string): Promise<App> {
        console.log("application", appId);
        const app = await App.findOne({where: {
            applicationId : appId
        }});
        return app;
    }
}

