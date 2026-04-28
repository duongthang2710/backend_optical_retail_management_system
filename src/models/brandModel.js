const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Brand = sequelize.define(
    "Brand",
    {
        brand_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        brand_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
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
        tableName: "Brands",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
);

Brand.associate = (models) => {
    Brand.hasMany(models.Product, { foreignKey: "brand_id", as: "products" });
};

module.exports = {
    Brand,
};
