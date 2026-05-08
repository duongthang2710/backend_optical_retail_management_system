const { sendResponse } = require("../utils/responseHandler");
const { USER_ROLES } = require("../models/userModel");

const VALID_ROLES = Object.values(USER_ROLES);

const validateUserIdParam = (req, res, next) => {
    const { id } = req.params;
    if (!id || isNaN(id) || Number(id) <= 0) {
        return sendResponse(res, 400, "Invalid user ID");
    }
    next();
};

const validateUpdateRole = (req, res, next) => {
    const { role } = req.body;
    if (!role || !VALID_ROLES.includes(role)) {
        return sendResponse(
            res,
            400,
            `Invalid role. Allowed: ${VALID_ROLES.join(", ")}`,
        );
    }
    next();
};

const validateUpdateActive = (req, res, next) => {
    const { is_active } = req.body;
    if (is_active === undefined || is_active === null) {
        return sendResponse(res, 400, "is_active is required");
    }
    if (typeof is_active !== "boolean") {
        return sendResponse(res, 400, "is_active must be a boolean");
    }
    next();
};

module.exports = {
    validateUserIdParam,
    validateUpdateRole,
    validateUpdateActive,
};
