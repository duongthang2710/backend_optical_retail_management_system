const { sendResponse } = require("../utils/responseHandler");

const isPositiveInteger = (value) => {
    const n = Number(value);
    return Number.isInteger(n) && n > 0;
};

const validateDiscountIdParam = (req, res, next) => {
    if (!isPositiveInteger(req.params.id)) {
        return sendResponse(res, 400, "Invalid discount id");
    }
    return next();
};

const validateProductIdParam = (req, res, next) => {
    if (!isPositiveInteger(req.params.productId)) {
        return sendResponse(res, 400, "Invalid product id");
    }
    return next();
};

const validateCreateDiscount = (req, res, next) => {
    const { type_discount, discount_value, start_date, end_date } = req.body;
    if (!type_discount) {
        return sendResponse(res, 400, "type_discount is required");
    }
    if (discount_value === undefined || discount_value === null) {
        return sendResponse(res, 400, "discount_value is required");
    }
    if (!start_date || !end_date) {
        return sendResponse(
            res,
            400,
            "start_date and end_date are required",
        );
    }
    return next();
};

const validateUpdateDiscount = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return sendResponse(res, 400, "Nothing to update");
    }
    return next();
};

module.exports = {
    validateDiscountIdParam,
    validateProductIdParam,
    validateCreateDiscount,
    validateUpdateDiscount,
};
