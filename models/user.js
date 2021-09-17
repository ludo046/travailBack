"use strict";


module.exports = (sequelize, Datatypes) => {
  const Users = sequelize.define(
    "users",
    {
      id:{
        autoIncrement: true,
        type: Datatypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      firstname: {
        allowNull: false,
        type: Datatypes.STRING
      },
      lastname: {
        allowNull: false,
        type: Datatypes.STRING
      },
      age: {
        allowNull: false,
        type: Datatypes.INTEGER
      },
      email: {
        allowNull: false,
        type: Datatypes.STRING,
        unique: "email_UNIQUE"
      },
      password: {
        allowNull: false,
        type: Datatypes.STRING
      },
      picture: {
        allowNull: true,
        type: Datatypes.STRING
      },
      isAdmin: {
        allowNull: false,
        type: Datatypes.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Datatypes.DATE,
        defaultValue: Datatypes.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Datatypes.DATE,
        defaultValue: Datatypes.NOW
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