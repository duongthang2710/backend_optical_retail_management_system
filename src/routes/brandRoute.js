const express = require("express");
const router = express.Router();

const brandController = require("../controllers/brandController");
const {
    validateBrandIdParam,
    validateCreateBrand,
    validateUpdateBrand,
} = require("../validators/brandValidator");
const { authMiddleware, isStaffOrAdmin } = require("../middlewares/authMiddleware");

router.get("/brands", brandController.getAllBrands);
router.get("/brands/:id", validateBrandIdParam, brandController.getBrandById);

router.post(
    "/brands",
    authMiddleware,
    isStaffOrAdmin,
    validateCreateBrand,
    brandController.createBrand,
);

router.put(
    "/brands/:id",
    authMiddleware,
    isStaffOrAdmin,
    validateBrandIdParam,
    validateUpdateBrand,
    brandController.updateBrand,
);

router.delete(
    "/brands/:id",
    authMiddleware,
    isStaffOrAdmin,
    validateBrandIdParam,
    brandController.deleteBrand,
);

module.exports = router;
