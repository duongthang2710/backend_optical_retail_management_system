const express = require("express");

const adminController = require("../controllers/adminController");
const adminUserController = require("../controllers/adminUserController");
const {
    authMiddleware,
    isAdmin,
    isStaffOrAdmin,
} = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const {
    loginValidator,
    refreshTokenValidator,
} = require("../validators/authValidator");
const {
    validateUserIdParam,
    validateUpdateRole,
    validateUpdateActive,
} = require("../validators/adminUserValidator");

const router = express.Router();

router.post("/login", loginValidator, validateRequest, adminController.login);
router.post(
    "/refresh-token",
    refreshTokenValidator,
    validateRequest,
    adminController.refreshToken,
);
router.post("/logout", authMiddleware, isStaffOrAdmin, adminController.logout);
router.get("/me", authMiddleware, isStaffOrAdmin, adminController.getProfile);

// User management — Admin only
router.get(
    "/users",
    authMiddleware,
    isAdmin,
    adminUserController.listUsers,
);
router.get(
    "/users/:id",
    authMiddleware,
    isAdmin,
    validateUserIdParam,
    adminUserController.getUser,
);
router.patch(
    "/users/:id/role",
    authMiddleware,
    isAdmin,
    validateUserIdParam,
    validateUpdateRole,
    adminUserController.updateUserRole,
);
router.patch(
    "/users/:id/active",
    authMiddleware,
    isAdmin,
    validateUserIdParam,
    validateUpdateActive,
    adminUserController.setUserActiveStatus,
);

module.exports = router;
