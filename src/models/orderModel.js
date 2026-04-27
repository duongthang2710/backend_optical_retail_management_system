const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Order = sequelize.define(
    "Order",
    {
        order_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            field: "user_ID",
        },
        address_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        order_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "Orders",
        timestamps: false,
    },
);

Order.associate = (models) => {
    if (models.ProductOrder) {
        Order.hasMany(models.ProductOrder, {
            foreignKey: "order_id",
            as: "items",
        });
    }
};

module.exports = {
    Order,
};
