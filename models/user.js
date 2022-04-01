'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.User.hasMany(models.Ressource, {
        foreignKey: "userId",
        onDelete: "SET NULL"
      });
      models.User.hasMany(models.Chat, {
        foreignKey:"userId",
        onDelete: "SET NULL"
      });
    }
  };
  User.init({
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    age: DataTypes.INTEGER,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    picture: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN,
    code: DataTypes.STRING,
    activate: DataTypes.BOOLEAN,
    passwordToken: DataTypes.STRING,
    online : DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};