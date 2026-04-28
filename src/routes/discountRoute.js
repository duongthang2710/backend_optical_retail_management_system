const express = require("express");

const discountController = require("../controllers/discountController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
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
    isAdmin,
    validateCreateDiscount,
    discountController.createDiscount,
);

router.put(
    "/:id",
    authMiddleware,
    isAdmin,
    validateDiscountIdParam,
    validateUpdateDiscount,
    discountController.updateDiscount,
);

router.delete(
    "/:id",
    authMiddleware,
    isAdmin,
    validateDiscountIdParam,
    discountController.deleteDiscount,
);

router.post(
    "/:id/products/:productId",
    authMiddleware,
    isAdmin,
    validateDiscountIdParam,
    validateProductIdParam,
    discountController.attachProduct,
);

router.delete(
    "/:id/products/:productId",
    authMiddleware,
    isAdmin,
    validateDiscountIdParam,
    validateProductIdParam,
    discountController.detachProduct,
);

module.exports = router;
