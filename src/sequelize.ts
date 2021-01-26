const { Sequelize } = require('sequelize-typescript');
import * as dotenv from "dotenv";
dotenv.config();

console.log(process.env.DB_CONNECTION_STRING)
const sequelize = new Sequelize(process.env.DB, process.env.DB_USER, process.env.DB_PASSWORD, {
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    dialect: 'postgres'
});

sequelize.addModels([__dirname + '/models/**']);
sequelize.repositoryMode = true;

export default sequelize