"use strict";


module.exports = (sequelize, Sequelize) => {
  const Users = Sequelize.define(
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
        type: Sequelize.STRING
      },
      lastname: {
        allowNull: false,
        type: Sequelize.STRING
      },
      age: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: "email_UNIQUE"
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },
      picture: {
        allowNull: true,
        type: Sequelize.STRING
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