const db = require("../models");
const { Op } = require("sequelize");
const ApiError = require("../utils/ApiError");
const statusCodes = require("http-status-codes").StatusCodes;

const Product = db.Product;
const ProductVariant = db.ProductVariant;

class ProductService {
    async getAllProducts(queryFilters) {
        const { material, shape, keyword, page = 1, limit = 10 } = queryFilters;
        let whereConditions = {};

        // Tìm kiếm theo tên sản phẩm
        if (keyword) {
            whereConditions.product_name = { [Op.like]: `%${keyword}%` };
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
        const { count, rows } = await Product.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: ProductVariant,
                    as: "variants",
                    where: { stock_quantity: { [Op.gt]: 0 } },
                    required: false,
                    attributes: [
                        "variant_id",
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
        const trans = await db.sequelize.transaction();
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
            const newProduct = await Product.create(
                {
                    product_name,
                    category_id,
                    brand_id,
                    material,
                    shape,
                    desc,
                },
                { transaction: trans },
            );

            //thêm variant nếu có
            if (variants && variants.length > 0) {
                const variantWithId = variants.map((v) => ({
                    ...v,
                    product_id: newProduct.product_id,
                }));
                await ProductVariant.bulkCreate(variantWithId, {
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

    async getProductById(productId) {
        const ProductById = await Product.findByPk(productId, {
            include: [
                {
                    model: ProductVariant,
                    as: "variants",
                    attributes: [
                        "variant_id",
                        "color",
                        "price",
                        "stock_quantity",
                        "image",
                    ]
                }
            ]
        }   
        )
        if (!ProductById) {
            throw new ApiError(statusCodes.NOT_FOUND, "Product not found");
        }
        return ProductById;
    }

    async updateProduct(productId, updateData) 
    {
        const trans = await db.sequelize.transaction();
        try {
            const product = await Product.findByPk(productId);
            if (!product) {
                const error = new ApiError(statusCodes.NOT_FOUND, "Product not found");
                throw error;
            }
            const { product_name, category_id, brand_id, material, shape, desc, variants } = updateData;
            // Cập nhật thông tin sản phẩm
            await product.update(
                {
                    product_name,
                    category_id,
                    brand_id,
                    material,
                    shape,
                    desc,
                },
                { transaction: trans }
            );
            // Xử lý cập nhật variants
            if (variants && Array.isArray(variants)) {
                for (const item of variants) {
                    if (item.variant_id) {
                        const [affectedRows] = await ProductVariant.update(
                            {
                                color: item.color,
                                price: item.price,
                                stock_quantity: item.stock_quantity,
                                image: item.image,
                            }, {
                            where: { variants_id: item.variant_id, product_id: productId },
                            transaction: trans
                        }
                        );
                        if (affectedRows === 0) {
                            const error = new ApiError(statusCodes.NOT_FOUND, `Variant with ID ${item.variant_id} not found for this product`);
                            throw error;
                        }
                    }
                    else {
                        if (!item.color || !item.price || !item.stock_quantity || !item.image) {
                            const error = new ApiError(statusCodes.BAD_REQUEST, "Missing required fields for new variant");
                            throw error;
                        }
                        await ProductVariant.create(
                            {
                                ...item,
                                product_id: productId,
                            },
                            { transaction: trans }
                        );
                    }
                }
            }
            await trans.commit();
            return true;
        } catch (error) {
            await trans.rollback();
            throw error;
        }
    }
}

module.exports = new ProductService();
