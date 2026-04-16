const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Address = sequelize.define('Address', {
    address_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    city: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    street: {
        type: DataTypes.STRING(255),
        allowNull: false
    }, 
    specifiable_address: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    moduleName: 'Address',
    tableName: 'addresses',
    timestamps: false   
});

Address.associate = (models) => {
    Address.hasMany(models.UserAddress, { foreignKey: 'address_id', as: 'user_addresses' });
}

module.exports = {
    Address
};