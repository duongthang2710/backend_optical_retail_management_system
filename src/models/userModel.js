const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const USER_ROLES = {
    CUSTOMER: "customer",
    ADMIN: "admin",
};

const normalizeEmail = (email) =>
    String(email || "")
        .trim()
        .toLowerCase();

const User = sequelize.define(
    "User",
    {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        full_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        phone_number: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        role: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: USER_ROLES.CUSTOMER,
        },
    },
    {
        sequelize,
        tableName: "Users",
        timestamps: false,
    },
);

module.exports = {
    User,
    USER_ROLES,
    normalizeEmail,
};
