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
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        brand_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: "Products",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
);

Product.associate = (models) => {
    Product.belongsTo(models.Brand, { foreignKey: "brand_id", as: "brand" });
    Product.belongsTo(models.Category, {
        foreignKey: "category_id",
        as: "category",
    });
    Product.hasMany(models.ProductVariant, {
        foreignKey: "product_id",
        as: "variants",
    });
    if (models.Discount && models.ProductDiscount) {
        Product.belongsToMany(models.Discount, {
            through: models.ProductDiscount,
            foreignKey: "product_id",
            otherKey: "discount_id",
            as: "discounts",
        });
    }
};

module.exports = {
    Product,
};
