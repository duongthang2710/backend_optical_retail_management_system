const product = require("../models/productModel");
const productVariant = require("../models/productVariantModel");
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
                    attributes: [
                        "id",
                        "color",
                        "price",
                        "stock_quantity",
                        "image",
                    ],
                },
            ],
            limit: Number(limit),
            offset: offset,
            distinct: true,
        });
        return {
            totalItems: count,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page),
            products: rows,
        };
    }

    async createProduct(productData) {
        const trans = await sequelize.transaction();
        try {
            const {
                product_name,
                category_id,
                brand_id,
                material,
                shape,
                desc,
                variants,
            } = productData;
            const newProduct = await product.createProduct(
                product_name,
                category_id,
                brand_id,
                material,
                shape,
                desc,
                { transaction: trans },
            );

            //thêm variant nếu có
            if (variants && variants.length > 0) {
                const variantWithId = variants.map((v) => ({
                    ...v,
                    product_id: newProduct.product_id,
                }));
                await productVariant.bulkCreate(variantWithId, {
                    transaction: trans,
                });
            }
            await trans.commit();
            return newProduct;
        } catch (error) {
            await trans.rollback();
            throw error;
        }
    }
}

module.exports = new ProductService();
