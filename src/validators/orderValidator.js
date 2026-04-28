const { sendResponse } = require("../utils/responseHandler");
const {
    ORDER_STATUS,
    PAYMENT_METHODS,
} = require("../models/orderModel");

const isPositiveInteger = (value) => {
    const n = Number(value);
    return Number.isInteger(n) && n > 0;
};

const VALID_STATUS = new Set(Object.values(ORDER_STATUS));
const VALID_METHODS = new Set(Object.values(PAYMENT_METHODS));

const validateOrderIdParam = (req, res, next) => {
    if (!isPositiveInteger(req.params.id)) {
        return sendResponse(res, 400, "Invalid order id");
    }
    return next();
};

const validateCheckout = (req, res, next) => {
    const { address_id, payment_method, shipping_fee } = req.body;
    if (!isPositiveInteger(address_id)) {
        return sendResponse(res, 400, "address_id is required");
    }
    if (payment_method !== undefined && !VALID_METHODS.has(payment_method)) {
        return sendResponse(
            res,
            400,
            `payment_method must be one of: ${Array.from(VALID_METHODS).join(", ")}`,
        );
    }
    if (
        shipping_fee !== undefined &&
        (Number.isNaN(Number(shipping_fee)) || Number(shipping_fee) < 0)
    ) {
        return sendResponse(
            res,
            400,
            "shipping_fee must be a non-negative number",
        );
    }
    return next();
};

const validateUpdateStatus = (req, res, next) => {
    const { status } = req.body;
    if (!status || !VALID_STATUS.has(status)) {
        return sendResponse(
            res,
            400,
            `status must be one of: ${Array.from(VALID_STATUS).join(", ")}`,
        );
    }
    return next();
};

module.exports = {
    validateOrderIdParam,
    validateCheckout,
    validateUpdateStatus,
};
