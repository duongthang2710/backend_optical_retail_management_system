const { Sequelize } = require('sequelize');

// Khởi tạo Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_NAME || 'test',      // Tên database
    process.env.DB_USER || 'root',      // User
    process.env.DB_PASSWORD || '',      // Password
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',               // QUAN TRỌNG: Khai báo để Sequelize biết dùng mysql2
        logging: false,                 // Tắt log SQL ra console để dễ nhìn
        pool: {
            max: 10,                    // connectionLimit: 10
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = sequelize;