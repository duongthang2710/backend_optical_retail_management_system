const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Address = sequelize.define(
    "Address",
    {
        address_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        city: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        street: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        specifiable_address: {
            type: DataTypes.TEXT,
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
        tableName: "Address",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
);

Address.associate = (models) => {
    if (models.UserAddress) {
        Address.hasMany(models.UserAddress, {
            foreignKey: "address_id",
            as: "user_addresses",
        });
    }
    if (models.Order) {
        Address.hasMany(models.Order, {
            foreignKey: "address_id",
            as: "orders",
        });
    }
};

module.exports = {
    Address,
};
