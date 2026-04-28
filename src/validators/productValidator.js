const { sendResponse } = require("../utils/responseHandler");
const ApiError = require("../utils/ApiError");
const statusCodes = require("http-status-codes").StatusCodes;

const VALID_SORT = new Set([
    "newest",
    "oldest",
    "price_asc",
    "price_desc",
    "name_asc",
    "name_desc",
]);

const isPositiveNumber = (value) =>
    !isNaN(value) && Number(value) >= 0;

const validateGetProductsQuery = (req, res, next) => {
    const {
        page,
        limit,
        price,
        min_price,
        max_price,
        category_id,
        brand_id,
        sort,
    } = req.query;

    if (page && (isNaN(page) || Number(page) <= 0)) {
        return sendResponse(
            res,
            400,
            "Invalid page number. Page must be a positive integer.",
        );
    }
    if (limit) {
        if (isNaN(limit) || Number(limit) <= 0) {
            return sendResponse(
                res,
                400,
                "Invalid limit. Limit must be a positive integer.",
            );
        }
        if (Number(limit) > 100) {
            return sendResponse(res, 400, "Limit cannot exceed 100.");
        }
    }

    for (const [key, val] of Object.entries({ price, min_price, max_price })) {
        if (val !== undefined && val !== null && val !== "") {
            if (!isPositiveNumber(val)) {
                return sendResponse(
                    res,
                    400,
                    `Invalid ${key}. Must be a non-negative number.`,
                );
            }
        }
    }

    if (
        min_price &&
        max_price &&
        Number(min_price) > Number(max_price)
    ) {
        return sendResponse(res, 400, "min_price must be <= max_price");
    }

    for (const [key, val] of Object.entries({ category_id, brand_id })) {
        if (val !== undefined && val !== "") {
            if (isNaN(val) || Number(val) <= 0) {
                return sendResponse(
                    res,
                    400,
                    `Invalid ${key}. Must be a positive integer.`,
                );
            }
        }
    }

    if (sort && !VALID_SORT.has(sort)) {
        return sendResponse(
            res,
            400,
            `Invalid sort. Allowed: ${Array.from(VALID_SORT).join(", ")}`,
        );
    }

    return next();
};

const validateCreateProduct = (req, res, next) => {
    const { product_name, category_id, brand_id, variants } = req.body;
    if (!product_name)
        return sendResponse(res, 400, "Product name is required.");
    if (!category_id || !brand_id)
        return sendResponse(res, 400, "Category ID and Brand ID are required.");
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
        return sendResponse(res, 400, "At least one variant is required.");
    }
    for (const v of variants) {
        if (!v.color)
            return sendResponse(res, 400, "Variant color if required.");
        if (
            v.price === undefined ||
            v.price === null ||
            isNaN(v.price) ||
            Number(v.price) <= 0
        ) {
            return sendResponse(
                res,
                400,
                "Variant price must be a positive number.",
            );
        }
        if (
            v.stock_quantity === undefined ||
            v.stock_quantity === null ||
            isNaN(v.stock_quantity) ||
            Number(v.stock_quantity) < 0
        ) {
            return sendResponse(
                res,
                400,
                "Variant stock quantity must be a non-negative integer.",
            );
        }
        if (!v.image) {
            return sendResponse(res, 400, "Variant image is required.");
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

const validateUpdateProduct = (req, res, next) => {
    const { productId } = req.params;
    const { variants } = req.body;
    if (!productId || isNaN(productId) || productId <= 0) {
        return next(
            new ApiError(
                statusCodes.BAD_REQUEST,
                "Invalid product ID. Product ID must be a positive integer.",
            ),
        );
    }
    if (variants) {
        if (!Array.isArray(variants)) {
            return next(
                new ApiError(
                    statusCodes.BAD_REQUEST,
                    "Variants must be an array.",
                ),
            );
        }

        for (const item of variants) {
            if (item.price !== undefined) {
                if (isNaN(item.price) || item.price < 0) {
                    return next(
                        new ApiError(
                            statusCodes.BAD_REQUEST,
                            "Variant price must be a positive number.",
                        ),
                    );
                }
            }

            if (item.stock_quantity !== undefined) {
                if (isNaN(item.stock_quantity) || item.stock_quantity < 0) {
                    return next(
                        new ApiError(
                            statusCodes.BAD_REQUEST,
                            "Variant stock quantity must be a non-negative integer.",
                        ),
                    );
                }
            }
        }
    }
    next();
};

const validateDeleteVariant = (req, res, next) => {
    const { variantId } = req.params;
    if (!variantId || isNaN(variantId) || variantId <= 0) {
        return next(
            new ApiError(
                statusCodes.BAD_REQUEST,
                "Invalid variant ID. Variant ID must be a positive integer.",
            ),
        );
    }
    next();
};

module.exports = {
    validateGetProductsQuery,
    validateCreateProduct,
    validateGetProductById,
    validateUpdateProduct,
    validateDeleteVariant,
};
