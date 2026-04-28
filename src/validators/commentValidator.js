const { sendResponse } = require("../utils/responseHandler");

const isPositiveInteger = (value) => {
    const n = Number(value);
    return Number.isInteger(n) && n > 0;
};

const validateCommentIdParam = (req, res, next) => {
    if (!isPositiveInteger(req.params.id)) {
        return sendResponse(res, 400, "Invalid comment id");
    }
    return next();
};

const validateVariantIdParam = (req, res, next) => {
    if (!isPositiveInteger(req.params.variantId)) {
        return sendResponse(res, 400, "Invalid variant id");
    }
    return next();
};

const validateCreateComment = (req, res, next) => {
    const { variant_id, rate } = req.body;
    if (!isPositiveInteger(variant_id)) {
        return sendResponse(
            res,
            400,
            "variant_id must be a positive integer",
        );
    }
    const r = Number(rate);
    if (!Number.isInteger(r) || r < 1 || r > 5) {
        return sendResponse(
            res,
            400,
            "rate must be an integer between 1 and 5",
        );
    }
    return next();
};

const validateUpdateComment = (req, res, next) => {
    const { rate, desc } = req.body;
    if (rate === undefined && desc === undefined) {
        return sendResponse(res, 400, "Nothing to update");
    }
    if (rate !== undefined) {
        const r = Number(rate);
        if (!Number.isInteger(r) || r < 1 || r > 5) {
            return sendResponse(
                res,
                400,
                "rate must be an integer between 1 and 5",
            );
        }
    }
    return next();
};

module.exports = {
    validateCommentIdParam,
    validateVariantIdParam,
    validateCreateComment,
    validateUpdateComment,
};
