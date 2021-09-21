'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ressource extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      models.Ressource.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user_ressource",
      });
    }
  };
  Ressource.init({
    userId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    image: DataTypes.STRING,
    movie: DataTypes.STRING,
    project: DataTypes.STRING,
    parcours: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Ressource',
  });
  return Ressource;
};