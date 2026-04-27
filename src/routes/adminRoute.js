const express = require("express");

const adminController = require("../controllers/adminController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const {
    loginValidator,
    refreshTokenValidator,
} = require("../validators/authValidator");

const router = express.Router();

router.post("/login", loginValidator, validateRequest, adminController.login);
router.post(
    "/refresh-token",
    refreshTokenValidator,
    validateRequest,
    adminController.refreshToken,
);
router.post("/logout", authMiddleware, isAdmin, adminController.logout);
router.get("/me", authMiddleware, isAdmin, adminController.getProfile);

module.exports = router;
