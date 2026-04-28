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
        reset_otp_hash: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        reset_otp_expires_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: "Users",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
);

User.associate = (models) => {
    if (models.UserAddress) {
        User.hasMany(models.UserAddress, {
            foreignKey: "user_id",
            as: "user_addresses",
        });
    }
    if (models.Order) {
        User.hasMany(models.Order, {
            foreignKey: "user_id",
            as: "orders",
        });
    }
    if (models.Comment) {
        User.hasMany(models.Comment, {
            foreignKey: "user_id",
            as: "comments",
        });
    }
};

module.exports = {
    User,
    USER_ROLES,
    normalizeEmail,
};
