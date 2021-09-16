"use strict";



module.exports = (sequelize, Sequelize) => {
  const Users = sequelize.define(
    "users",
    {
      id:{
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      firstname: {
        allowNull: false,
        type : Sequelize.STRING(100),
      },
      lastname: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      age: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING(255),
        unique: "email_UNIQUE"
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING(255)
      },
      picture: {
        allowNull: true,
        type: Sequelize.STRING(255)
      },
      isAdmin: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
    },
    {
      sequelize,
      tableName: "users",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "email_UNIQUE",
          unique: true,
          using: "BTREE",
          fields: [{ name: "email" }],
        },
      ],
    }
  );
  return Users;
}