const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const UserAddress = sequelize.define('UserAddress', {
    user_id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false
    },
    address_id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    moduleName: 'UserAddress',
    tableName: 'user_addresses',
    timestamps: false   
});

UserAddress.associate = (models) => {
    UserAddress.belongsTo(models.User, { foreignKey: 'user_id', as: 'users' });
    UserAddress.belongsTo(models.Address, { foreignKey: 'address_id', as: 'addresses' });
}

module.exports = {
    UserAddress
};