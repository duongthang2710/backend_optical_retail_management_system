const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const DISCOUNT_TYPES = {
    PERCENT: "Percent",
    FIXED: "Fixed",
};

const Discount = sequelize.define(
    "Discount",
    {
        discount_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        type_discount: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        discount_value: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        discount_number: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
        tableName: "Discounts",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
);

Discount.associate = (models) => {
    if (models.Product && models.ProductDiscount) {
        Discount.belongsToMany(models.Product, {
            through: models.ProductDiscount,
            foreignKey: "discount_id",
            otherKey: "product_id",
            as: "products",
        });
    }
};

module.exports = {
    Discount,
    DISCOUNT_TYPES,
};
