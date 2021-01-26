const { Sequelize } = require('sequelize-typescript');

const sequelize = new Sequelize('postgres://postgres:slycc\@2o2o@0.0.0.0:5432/chat-server')
sequelize.addModels([__dirname + '/models/**']);
sequelize.repositoryMode = true;

export default sequelize