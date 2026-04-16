const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Category = sequelize.define('Category', {
    category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category_name: {
        type: DataTypes.STRING, 
        allowNull: false
    },
    desc: {
        type: DataTypes.TEXT
    }
}, {
    sequelize,
    moduleName: 'Category',
    tableName: 'categories',
    timestamps: false   
});

Category.associate = (models) => {
    Category.hasMany(models.Product, { foreignKey: 'category_id', as: 'products' });
};

module.exports = {
    Category
};