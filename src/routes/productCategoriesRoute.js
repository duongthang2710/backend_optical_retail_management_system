const express = require("express");
const router = express.Router();

const productController = require("../controllers/productCategoriesController");
const {
    validateGetProductsQuery,
    validateCreateProduct,
    validateGetProductById,
    validateUpdateProduct,
    validateDeleteVariant
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

router.put(
    "/products/:productId",
    isAdmin,
    validateUpdateProduct,
    productController.updateProduct,
)

router.delete(
    "/products/:productId",
    isAdmin,
    validateGetProductById,
    productController.deleteProduct,
)

router.delete("/products/:productId/variants/:variantId",
    isAdmin,
    validateDeleteVariant,
    productController.deleteVariant,
)
module.exports = router;
