const { sendResponse } = require("../utils/responseHandler");

const isPositiveInteger = (value) => {
    const normalized = Number(value);
    return Number.isInteger(normalized) && normalized > 0;
};

const isNonNegativeInteger = (value) => {
    const normalized = Number(value);
    return Number.isInteger(normalized) && normalized >= 0;
};

const validateVariantIdParam = (req, res, next) => {
    const { variantId } = req.params;

    if (!isPositiveInteger(variantId)) {
        return sendResponse(
            res,
            400,
            "Invalid variant ID. Variant ID must be a positive integer.",
        );
    }

    return next();
};

const validateAddCartItem = (req, res, next) => {
    const { variant_id, quantity } = req.body;

    if (!isPositiveInteger(variant_id)) {
        return sendResponse(
            res,
            400,
            "Invalid variant_id. variant_id must be a positive integer.",
        );
    }

    if (!isPositiveInteger(quantity)) {
        return sendResponse(
            res,
            400,
            "Invalid quantity. Quantity must be a positive integer.",
        );
    }

    return next();
};

const validateUpdateCartItem = (req, res, next) => {
    const { quantity } = req.body;

    if (!isNonNegativeInteger(quantity)) {
        return sendResponse(
            res,
            400,
            "Invalid quantity. Quantity must be a non-negative integer.",
        );
    }

    return next();
};

module.exports = {
    validateVariantIdParam,
    validateAddCartItem,
    validateUpdateCartItem,
};
