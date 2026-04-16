const express = require("express");
const router = express.Router();

const productController = require("../controllers/productCategoriesController");
const { productValidator } = require("../validators/productValidator");
const { optionalAuth } = require("../middlewares/optionalAuth");

router.get(
  "/products",
  optionalAuth.optionalAuth,
  productValidator.validateGetProductsQuery,
  productController.getAllProducts,
);
