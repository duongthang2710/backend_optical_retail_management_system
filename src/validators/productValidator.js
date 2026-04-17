const { sendResponse } = require("../utils/responseHandler");
const ApiError = require("../utils/ApiError");
const statusCodes = require("http-status-codes").StatusCodes;

const validateGetProductsQuery = (req, res, next) => {
    const { page, limit, material, color, price } = req.query;

    // Kiểm tra page
    if (page && (isNaN(page) || page <= 0)) {
        return sendResponse(
            res,
            400,
            "Invalid page number. Page must be a positive integer.",
        );
    }
    // Kiểm tra limit
    if (limit) {
        if (isNaN(limit) || limit <= 0) {
            return sendResponse(
                res,
                400,
                "Invalid limit. Limit must be a positive integer.",
            );
        }
        if (limit > 100) {
            return sendResponse(res, 400, "Limit cannot exceed 100.");
        }
    }

    return next();
};

const validateCreateProduct = (req, res, next) => {
    const { product_name, category_id, brand_id, vardiants } = req.body;
    if (!product_name)
        return sendResponse(res, 400, "Product name is required.");
    if (!category_id || !brand_id)
        return sendResponse(res, 400, "Category ID and Brand ID are required.");
    if (!vardiants || !Array.isArray(vardiants) || vardiants.length === 0) {
        return sendResponse(res, 400, "At least one variant is required.");
    }
    for (const v of vardiants) {
        if (!v.color)
            return sendResponse(res, 400, "Variant color if required.");
        if (!v.price || isNaN(v.price) || v.price <= 0) {
            return sendResponse(
                res,
                400,
                "Variant price must be a positive number.",
            );
        }
        if (
            !v.stock_quantity ||
            isNaN(v.stock_quantity) ||
            v.stock_quantity < 0
        ) {
            return sendResponse(
                res,
                400,
                "Variant stock quantity must be a non-negative integer.",
            );
        }
    }

    return next();
};

const validateGetProductById = (req, res, next) => {
    const { productId } = req.params;
    if (!productId || isNaN(productId) || productId <= 0) {
        return next(
            new ApiError(
                statusCodes.BAD_REQUEST,
                "Invalid product ID. Product ID must be a positive integer.",
            ),
        );
    }
    return next();
};

module.exports = {
    validateGetProductsQuery,
    validateCreateProduct,
    validateGetProductById,
};
