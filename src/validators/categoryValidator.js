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
    const { category_name } = req.body;
    if (!category_name || String(category_name).trim() === "") {
        return sendResponse(res, 400, "category_name is required");
    }
    return next();
};

const validateUpdateCategory = (req, res, next) => {
    const { category_name, desc } = req.body;
    if (category_name !== undefined && String(category_name).trim() === "") {
        return sendResponse(res, 400, "category_name cannot be empty");
    }
    if (category_name === undefined && desc === undefined) {
        return sendResponse(res, 400, "Nothing to update");
    }
    return next();
};

module.exports = {
    validateCategoryIdParam,
    validateCreateCategory,
    validateUpdateCategory,
};
