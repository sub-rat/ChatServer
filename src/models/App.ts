import {
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    Model,
    Table,
    Column,
    DataType,
    Index,
    AllowNull, IsUUID, PrimaryKey, AutoIncrement, BeforeCreate
} from 'sequelize-typescript';
const { uuid } = require('uuidv4');

@Table
export class App extends Model{

    @IsUUID(4)
    @PrimaryKey
    @Column(DataType.UUID)
    id: string;

    @BeforeCreate
    static generateUUidV4(instance: App) {
        instance.id = uuid();
    }

    @AllowNull(false)
    @Index
    @Column
    name!: string;

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

