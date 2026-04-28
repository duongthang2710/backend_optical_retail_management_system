const express = require("express");
const router = express.Router();

const brandController = require("../controllers/brandController");
const {
    validateBrandIdParam,
    validateCreateBrand,
    validateUpdateBrand,
} = require("../validators/brandValidator");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.get("/brands", brandController.getAllBrands);
router.get("/brands/:id", validateBrandIdParam, brandController.getBrandById);

router.post(
    "/brands",
    authMiddleware,
    isAdmin,
    validateCreateBrand,
    brandController.createBrand,
);

router.put(
    "/brands/:id",
    authMiddleware,
    isAdmin,
    validateBrandIdParam,
    validateUpdateBrand,
    brandController.updateBrand,
);

router.delete(
    "/brands/:id",
    authMiddleware,
    isAdmin,
    validateBrandIdParam,
    brandController.deleteBrand,
);

module.exports = router;
