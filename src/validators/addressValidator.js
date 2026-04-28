const { sendResponse } = require("../utils/responseHandler");

const isPositiveInteger = (value) => {
    const n = Number(value);
    return Number.isInteger(n) && n > 0;
};

const validateAddressIdParam = (req, res, next) => {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
        return sendResponse(res, 400, "Invalid address id");
    }
    return next();
};

const validateCreateAddress = (req, res, next) => {
    const { city, street } = req.body;
    if (!city || String(city).trim() === "") {
        return sendResponse(res, 400, "city is required");
    }
    if (!street || String(street).trim() === "") {
        return sendResponse(res, 400, "street is required");
    }
    return next();
};

const validateUpdateAddress = (req, res, next) => {
    const { city, street, specifiable_address } = req.body;
    if (
        city === undefined &&
        street === undefined &&
        specifiable_address === undefined
    ) {
        return sendResponse(res, 400, "Nothing to update");
    }
    if (city !== undefined && String(city).trim() === "") {
        return sendResponse(res, 400, "city cannot be empty");
    }
    if (street !== undefined && String(street).trim() === "") {
        return sendResponse(res, 400, "street cannot be empty");
    }
    return next();
};

module.exports = {
    validateAddressIdParam,
    validateCreateAddress,
    validateUpdateAddress,
};
