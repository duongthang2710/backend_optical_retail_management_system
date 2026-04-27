const express = require("express");

const authController = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const {
    changePasswordValidator,
    forgotPasswordValidator,
    loginValidator,
    refreshTokenValidator,
    registerValidator,
    resetPasswordValidator,
} = require("../validators/authValidator");

const router = express.Router();

router.post(
    "/register",
    registerValidator,
    validateRequest,
    authController.register,
);
router.post("/login", loginValidator, validateRequest, authController.login);
router.post("/logout", authMiddleware, authController.logout);
router.post(
    "/refresh-token",
    refreshTokenValidator,
    validateRequest,
    authController.refreshToken,
);
router.post(
    "/forgot-password",
    forgotPasswordValidator,
    validateRequest,
    authController.forgotPassword,
);
router.post(
    "/reset-password",
    resetPasswordValidator,
    validateRequest,
    authController.resetPassword,
);
router.post(
    "/change-password",
    authMiddleware,
    changePasswordValidator,
    validateRequest,
    authController.changePassword,
);

module.exports = router;
