const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Discount = sequelize.define('Discount', {
    discount_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type_discount: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    discount_value: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    discount_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        check: {            
           min: 0
        }
    },
    desc : {
        type: DataTypes.TEXT
    }
}, {
    sequelize,
    moduleName: 'Discount',
    tableName: 'discounts',
    timestamps: false   
});

module.exports = {
    Discount
};