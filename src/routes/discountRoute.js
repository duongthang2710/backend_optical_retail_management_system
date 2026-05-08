const express = require("express");

const discountController = require("../controllers/discountController");
const { authMiddleware, isStaffOrAdmin } = require("../middlewares/authMiddleware");
const {
    validateDiscountIdParam,
    validateProductIdParam,
    validateCreateDiscount,
    validateUpdateDiscount,
} = require("../validators/discountValidator");

const router = express.Router();

router.get("/", discountController.getAllDiscounts);
router.get(
    "/:id",
    validateDiscountIdParam,
    discountController.getDiscountById,
);

router.post(
    "/",
    authMiddleware,
    isStaffOrAdmin,
    validateCreateDiscount,
    discountController.createDiscount,
);

router.put(
    "/:id",
    authMiddleware,
    isStaffOrAdmin,
    validateDiscountIdParam,
    validateUpdateDiscount,
    discountController.updateDiscount,
);

router.delete(
    "/:id",
    authMiddleware,
    isStaffOrAdmin,
    validateDiscountIdParam,
    discountController.deleteDiscount,
);

router.post(
    "/:id/products/:productId",
    authMiddleware,
    isStaffOrAdmin,
    validateDiscountIdParam,
    validateProductIdParam,
    discountController.attachProduct,
);

router.delete(
    "/:id/products/:productId",
    authMiddleware,
    isStaffOrAdmin,
    validateDiscountIdParam,
    validateProductIdParam,
    discountController.detachProduct,
);

module.exports = router;
