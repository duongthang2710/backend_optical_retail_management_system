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
            defaultValue: 0,
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: "Product_Variants",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
);

ProductVariant.associate = (models) => {
    ProductVariant.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
    });
    if (models.Comment) {
        ProductVariant.hasMany(models.Comment, {
            foreignKey: "variant_id",
            as: "comments",
        });
    }
};

module.exports = {
    ProductVariant,
};
