import Sequelize from 'sequelize';
import dbConfig from '../config/db.config.js';

const sequelize = new Sequelize({
  dialect: dbConfig.dialect,
  storage: dbConfig.storage,
  logging: false,
});

export default sequelize;
