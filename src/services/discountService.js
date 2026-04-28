const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const ApiError = require("../utils/ApiError");

const Discount = db.Discount;
const Product = db.Product;
const ProductDiscount = db.ProductDiscount;

const VALID_TYPES = new Set(["Percent", "Fixed"]);

class DiscountService {
    async getAll(query) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
        const offset = (page - 1) * limit;

        const where = {};
        if (query.is_active !== undefined && query.is_active !== "") {
            where.is_active =
                query.is_active === "true" || query.is_active === true;
        }

        const { count, rows } = await Discount.findAndCountAll({
            where,
            limit,
            offset,
            order: [["discount_id", "ASC"]],
        });

        return {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            discounts: rows,
        };
    }

    async getById(id) {
        const discount = await Discount.findByPk(id, {
            include: [
                {
                    model: Product,
                    as: "products",
                    through: { attributes: [] },
                    attributes: ["product_id", "product_name"],
                },
            ],
        });
        if (!discount) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Discount not found");
        }
        return discount;
    }

    async create(payload) {
        const {
            type_discount,
            discount_value,
            start_date,
            end_date,
            discount_number,
            desc,
        } = payload;

        if (!VALID_TYPES.has(type_discount)) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "type_discount must be 'Percent' or 'Fixed'",
            );
        }
        if (!Number.isFinite(Number(discount_value)) || discount_value <= 0) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "discount_value must be > 0",
            );
        }
        if (!start_date || !end_date) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "start_date and end_date are required",
            );
        }
        if (new Date(start_date) > new Date(end_date)) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "end_date must be >= start_date",
            );
        }

        return Discount.create({
            type_discount,
            discount_value,
            start_date,
            end_date,
            discount_number: discount_number ?? null,
            desc: desc ?? null,
        });
    }

    async update(id, payload) {
        const discount = await Discount.findByPk(id);
        if (!discount) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Discount not found");
        }

        const updatePayload = {};
        if (payload.type_discount !== undefined) {
            if (!VALID_TYPES.has(payload.type_discount)) {
                throw new ApiError(
                    StatusCodes.BAD_REQUEST,
                    "type_discount must be 'Percent' or 'Fixed'",
                );
            }
            updatePayload.type_discount = payload.type_discount;
        }
        if (payload.discount_value !== undefined) {
            updatePayload.discount_value = payload.discount_value;
        }
        if (payload.start_date !== undefined) {
            updatePayload.start_date = payload.start_date;
        }
        if (payload.end_date !== undefined) {
            updatePayload.end_date = payload.end_date;
        }
        if (payload.discount_number !== undefined) {
            updatePayload.discount_number = payload.discount_number;
        }
        if (payload.desc !== undefined) {
            updatePayload.desc = payload.desc;
        }
        if (payload.is_active !== undefined) {
            updatePayload.is_active = Boolean(payload.is_active);
        }

        await discount.update(updatePayload);
        return discount;
    }

    async remove(id) {
        const discount = await Discount.findByPk(id);
        if (!discount) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Discount not found");
        }
        await discount.update({ is_active: false });
        return true;
    }

    async attachProduct(discountId, productId) {
        const discount = await Discount.findByPk(discountId);
        if (!discount) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Discount not found");
        }
        const product = await Product.findByPk(productId);
        if (!product) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
        }

        const [link, created] = await ProductDiscount.findOrCreate({
            where: { discount_id: discountId, product_id: productId },
            defaults: {
                discount_id: discountId,
                product_id: productId,
            },
        });

        return { link, created };
    }

    async detachProduct(discountId, productId) {
        const removed = await ProductDiscount.destroy({
            where: { discount_id: discountId, product_id: productId },
        });
        if (!removed) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                "Product not attached to this discount",
            );
        }
        return true;
    }
}

module.exports = new DiscountService();
