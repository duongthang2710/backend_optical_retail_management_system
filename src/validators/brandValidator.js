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
    const { brand_name } = req.body;
    if (!brand_name || String(brand_name).trim() === "") {
        return sendResponse(res, 400, "brand_name is required");
    }
    return next();
};

const validateUpdateBrand = (req, res, next) => {
    const { brand_name, desc } = req.body;
    if (brand_name !== undefined && String(brand_name).trim() === "") {
        return sendResponse(res, 400, "brand_name cannot be empty");
    }
    if (brand_name === undefined && desc === undefined) {
        return sendResponse(res, 400, "Nothing to update");
    }
    return next();
};

module.exports = {
    validateBrandIdParam,
    validateCreateBrand,
    validateUpdateBrand,
};
