const { sendResponse } = require("../utils/responseHandler");

const isPositiveInteger = (value) => {
    const n = Number(value);
    return Number.isInteger(n) && n > 0;
};

const validateCategoryIdParam = (req, res, next) => {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
        return sendResponse(res, 400, "Invalid category id");
    }
    return next();
};

const validateCreateCategory = (req, res, next) => {
    const { category_name, is_active } = req.body;
    if (!category_name || String(category_name).trim() === "") {
        return sendResponse(res, 400, "category_name is required");
    }
    if (is_active !== undefined) {
        const normalized = String(is_active).trim();
        const valid =
            is_active === 0 ||
            is_active === 1 ||
            ["0", "1"].includes(normalized);
        if (!valid) {
            return sendResponse(res, 400, "is_active must be 0 or 1");
        }
    }
    return next();
};

const validateUpdateCategory = (req, res, next) => {
    const { category_name, desc, is_active } = req.body;
    if (category_name !== undefined && String(category_name).trim() === "") {
        return sendResponse(res, 400, "category_name cannot be empty");
    }
    if (is_active !== undefined) {
        const normalized = String(is_active).trim();
        const valid =
            is_active === 0 ||
            is_active === 1 ||
            ["0", "1"].includes(normalized);
        if (!valid) {
            return sendResponse(res, 400, "is_active must be 0 or 1");
        }
    }
    if (
        category_name === undefined &&
        desc === undefined &&
        is_active === undefined
    ) {
        return sendResponse(res, 400, "Nothing to update");
    }
    return next();
};

module.exports = {
    validateCategoryIdParam,
    validateCreateCategory,
    validateUpdateCategory,
};
