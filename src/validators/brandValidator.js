const { sendResponse } = require("../utils/responseHandler");

const isPositiveInteger = (value) => {
    const n = Number(value);
    return Number.isInteger(n) && n > 0;
};

const validateBrandIdParam = (req, res, next) => {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
        return sendResponse(res, 400, "Invalid brand id");
    }
    return next();
};

const validateCreateBrand = (req, res, next) => {
    const { brand_name, is_active } = req.body;
    if (!brand_name || String(brand_name).trim() === "") {
        return sendResponse(res, 400, "brand_name is required");
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

const validateUpdateBrand = (req, res, next) => {
    const { brand_name, desc, is_active } = req.body;
    if (brand_name !== undefined && String(brand_name).trim() === "") {
        return sendResponse(res, 400, "brand_name cannot be empty");
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
        brand_name === undefined &&
        desc === undefined &&
        is_active === undefined
    ) {
        return sendResponse(res, 400, "Nothing to update");
    }
    return next();
};

module.exports = {
    validateBrandIdParam,
    validateCreateBrand,
    validateUpdateBrand,
};
