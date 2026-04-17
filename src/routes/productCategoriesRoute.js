const express = require("express");
const router = express.Router();

const productController = require("../controllers/productCategoriesController");
const {
    validateGetProductsQuery,
    validateCreateProduct,
    validateGetProductById
} = require("../validators/productValidator");
const { optionalAuth } = require("../middlewares/optionalAuthMiddleware");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.get(
    "/products",
    optionalAuth,
    validateGetProductsQuery,
    productController.getAllProducts,
);

router.get(
    "/products/:productId",
    optionalAuth,
    validateGetProductById,
    productController.getProductById,
);

router.post(
    "/products",
    isAdmin,
    validateCreateProduct,
    productController.createProduct,
);

module.exports = router;
