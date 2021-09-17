"use strict";

require("dotenv").config();

const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  process.env.DB,
  process.env.USERS,
  process.env.PASSWORD,
  {
    host: process.env.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: 0,

    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle,
    },
  }
);
const db = {
  User = require("./user")(Sequelize,sequelize),
  Ressource = require('./ressource')(Sequelize,sequelize),
  Chat = require('./chat')(Sequelize,sequelize),
};

db.Sequelize = Sequelize;
db.sequelize = sequelize;






db.User.hasMany(db.Ressource, {
  foreignKey: "userId",
  as: "user_ressource",
});

db.Ressource.belongsTo(db.User, {
  foreignKey: "userId",
  as: "user_ressource",
});
npm 
db.User.hasMany(db.Chat, {
  foreignKey:"userId",
  as: "user_chat"
});

db.Chat.belongsTo(db.User, {
  foreignKey: "userId",
  as: "user_chat"
})

module.exports = db