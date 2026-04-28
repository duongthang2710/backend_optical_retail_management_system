const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const ProductDiscount = sequelize.define(
    "ProductDiscount",
    {
        product_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            allowNull: false,
        },
        discount_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "Product_Discount",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
    },
);

ProductDiscount.associate = (models) => {
    if (models.Product) {
        ProductDiscount.belongsTo(models.Product, {
            foreignKey: "product_id",
            as: "product",
        });
    }
    if (models.Discount) {
        ProductDiscount.belongsTo(models.Discount, {
            foreignKey: "discount_id",
            as: "discount",
        });
    }
};

module.exports = {
    ProductDiscount,
};
