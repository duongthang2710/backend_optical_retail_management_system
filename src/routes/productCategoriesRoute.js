const express = require("express");
const router = express.Router();

const productController = require("../controllers/productCategoriesController");
const { validateGetProductsQuery, validateCreateProduct } = require("../validators/productValidator");
const { optionalAuth } = require("../middlewares/optionalAuthMiddleware");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.get(
  "/products",
  optionalAuth,
  validateGetProductsQuery,
  productController.getAllProducts,
);

router.post(
    "/products",
    isAdmin,
    validateCreateProduct,
    productController.createProduct,
);
