const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const UserAddress = sequelize.define(
    "UserAddress",
    {
        user_id: {
            primaryKey: true,
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        address_id: {
            primaryKey: true,
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "User_Address",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
    },
);

UserAddress.associate = (models) => {
    UserAddress.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
    });
    UserAddress.belongsTo(models.Address, {
        foreignKey: "address_id",
        as: "address",
    });
};

module.exports = {
    UserAddress,
};
