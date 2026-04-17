const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Đường dẫn đến file config bạn vừa sửa
const db = {};

const isSequelizeModel = (value) => {
    return Boolean(
        value &&
        (typeof value === "function" || typeof value === "object") &&
        value.sequelize &&
        typeof value.getTableName === "function" &&
        value.rawAttributes,
    );
};

// 1. Đọc tất cả các file trong thư mục hiện tại (models/)
fs.readdirSync(__dirname)
    .filter((file) => {
        // Chỉ lấy các file .js và không lấy file index.js này
        return (
            file.indexOf(".") !== 0 &&
            file !== "index.js" &&
            file.slice(-3) === ".js"
        );
    })
    .forEach((file) => {
        // Import từng model
        const exported = require(path.join(__dirname, file));

        // Nếu model được export dưới dạng function (chuẩn Sequelize CLI)
        if (typeof exported === "function") {
            const modelInstance = exported(sequelize, DataTypes);
            db[modelInstance.name] = modelInstance;
            return;
        }

        // Hỗ trợ kiểu export object: module.exports = { Product }
        if (exported && typeof exported === "object") {
            Object.values(exported).forEach((value) => {
                if (isSequelizeModel(value)) {
                    db[value.name] = value;
                }
            });
        }
    });

// 2. Kích hoạt các mối quan hệ (Associations)
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        try {
            db[modelName].associate(db);
        } catch (error) {
            console.warn(
                `[models/index] Skip associate for ${modelName}: ${error.message}`,
            );
        }
    }
});

// 3. Đính kèm instance sequelize vào đối tượng db để dùng ở nơi khác nếu cần
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
