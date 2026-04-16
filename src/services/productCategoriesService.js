const { product, productVariant } = require("../models/productModel");
const { Op } = require("sequelize");

class ProductService {
    async getAllProducts(queryFilters) {
        const { material, shape, keyword, page = 1, limit = 10 } = queryFilters;
        let whereConditions = {};

        // Tìm kiếm theo tên sản phẩm
        if (keyword) {
            whereConditions.Product_name = { [Op.like]: `%${keyword}%` };
        }

        // Lọc theo chất liệu, hình dạng, giá tiền
        if (material) {
            whereConditions.material = material;
        }
        if (shape) {
            whereConditions.shape = shape;
        }
        if (queryFilters.price) {
            whereConditions.price = { [Op.lte]: queryFilters.price };
        }
        // Xử lý phân trang
        const offset = (Number(page) - 1) * Number(limit);
        // Truy vấn DB
        const { count, rows } = await product.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: productVariant,
                    as: "variants",
                    attributes: ["id", "color", "price", "stock_quantity", "image"],
                }
            ],
            limit: Number(limit),
            ofset: offset,
            distinct: true
        });
        return {
            totalItems: count,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page),
            products: rows
        };
    }
}

module.exports = new ProductService();
