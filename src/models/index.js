const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Đường dẫn đến file config bạn vừa sửa
const db = {};

// 1. Đọc tất cả các file trong thư mục hiện tại (models/)
fs.readdirSync(__dirname)
  .filter(file => {
    // Chỉ lấy các file .js và không lấy file index.js này
    return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    // Import từng model
    const model = require(path.join(__dirname, file));
    
    // Nếu model được export dưới dạng function (chuẩn Sequelize CLI)
    if (typeof model === 'function') {
      const modelInstance = model(sequelize, DataTypes);
      db[modelInstance.name] = modelInstance;
    } else {
      // Nếu bạn export trực tiếp object (như cách bạn đang làm)
      db[model.name] = model;
    }
  });

// 2. Kích hoạt các mối quan hệ (Associations)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// 3. Đính kèm instance sequelize vào đối tượng db để dùng ở nơi khác nếu cần
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;