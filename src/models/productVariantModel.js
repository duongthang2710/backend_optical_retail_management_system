const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const ProductVariant = sequelize.define(
    "ProductVariant",
    {
        variant_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        stock_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    {
        sequelize,
        moduleName: "ProductVariant",
        tableName: "Product_Variants",
        timestamps: false,
    },
);

ProductVariant.associate = (models) => {
    ProductVariant.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
    });
};

module.exports = {
    ProductVariant,
};
