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
const { authMiddleware, isStaffOrAdmin } = require("../middlewares/authMiddleware");

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
    isStaffOrAdmin,
    validateCreateProduct,
    productController.createProduct,
);

router.put(
    "/products/:productId",
    authMiddleware,
    isStaffOrAdmin,
    validateUpdateProduct,
    productController.updateProduct,
);

router.delete(
    "/products/:productId",
    authMiddleware,
    isStaffOrAdmin,
    validateGetProductById,
    productController.deleteProduct,
);

router.delete(
    "/products/:productId/variants/:variantId",
    authMiddleware,
    isStaffOrAdmin,
    validateDeleteVariant,
    productController.deleteVariant,
);
module.exports = router;
