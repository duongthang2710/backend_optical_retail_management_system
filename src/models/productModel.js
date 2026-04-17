const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Product = sequelize.define(
    "Product",
    {
        product_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        product_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        material: {
            type: DataTypes.STRING,
        },
        shape: {
            type: DataTypes.STRING,
        },
        desc: {
            type: DataTypes.TEXT,
        },
    },
    {
        sequelize,
        moduleName: "Product",
        tableName: "Products",
        timestamps: false,
    },
);

// 1. Định nghĩa quan hệ
Product.associate = (models) => {
    Product.belongsTo(models.Brand, { foreignKey: "brand_id" });
    Product.belongsTo(models.Category, { foreignKey: "category_id" });
    Product.hasMany(models.ProductVariant, {
        foreignKey: "product_id",
        as: "variants",
    });
};

module.exports = {
    Product,
};
