const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const ProductOrder = sequelize.define(
    "ProductOrder",
    {
        variant_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            allowNull: false,
        },
        order_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            allowNull: false,
        },
        price_at_purchase: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        discount_amount: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "Product_Order",
        timestamps: false,
    },
);

ProductOrder.associate = (models) => {
    if (models.Order) {
        ProductOrder.belongsTo(models.Order, {
            foreignKey: "order_id",
            as: "order",
        });
    }

    if (models.ProductVariant) {
        ProductOrder.belongsTo(models.ProductVariant, {
            foreignKey: "variant_id",
            as: "variant",
        });
    }
};

module.exports = {
    ProductOrder,
};
