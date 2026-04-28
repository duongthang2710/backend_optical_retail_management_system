const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Comment = sequelize.define(
    "Comment",
    {
        comment_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        variant_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: "user_ID",
        },
        order_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        rate: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
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
        tableName: "Comments",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
);

Comment.associate = (models) => {
    if (models.User) {
        Comment.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
        });
    }
    if (models.ProductVariant) {
        Comment.belongsTo(models.ProductVariant, {
            foreignKey: "variant_id",
            as: "variant",
        });
    }
    if (models.Order) {
        Comment.belongsTo(models.Order, {
            foreignKey: "order_id",
            as: "order",
        });
    }
};

module.exports = {
    Comment,
};
