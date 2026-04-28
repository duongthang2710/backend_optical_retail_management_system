const express = require("express");
const router = express.Router();

const productController = require("../controllers/productCategoriesController");
const {
    validateGetProductsQuery,
    validateCreateProduct,
    validateGetProductById,
    validateUpdateProduct,
    validateDeleteVariant,
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

router.get(
    "/products/:productId/related",
    optionalAuth,
    validateGetProductById,
    productController.getRelatedProducts,
);

router.post(
    "/products",
    authMiddleware,
    isAdmin,
    validateCreateProduct,
    productController.createProduct,
);

router.put(
    "/products/:productId",
    authMiddleware,
    isAdmin,
    validateUpdateProduct,
    productController.updateProduct,
);

router.delete(
    "/products/:productId",
    authMiddleware,
    isAdmin,
    validateGetProductById,
    productController.deleteProduct,
);

router.delete(
    "/products/:productId/variants/:variantId",
    authMiddleware,
    isAdmin,
    validateDeleteVariant,
    productController.deleteVariant,
);
module.exports = router;
