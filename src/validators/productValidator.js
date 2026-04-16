const { sendResponse } = require("../utils/responseHandler");

const validateGetProductsQuery = (req, res, next) => {
    const { page, limit, material, color, price } = req.query;
    
    // Kiểm tra page
    if (page && (isNaN(page) || page <= 0)) {
        return sendResponse(res, 400, "Invalid page number. Page must be a positive integer.");
    }
    // Kiểm tra limit
    if (limit) {
        if (isNaN(limit) || limit <= 0) {
            return sendResponse(res, 400, "Invalid limit. Limit must be a positive integer.");
        }
        if (limit > 100) {
            return sendResponse(res, 400, "Limit cannot exceed 100.");
        }
    }
    
}
module.exports = { validateGetProductsQuery };