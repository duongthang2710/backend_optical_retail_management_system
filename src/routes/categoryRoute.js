const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const {
    validateCategoryIdParam,
    validateCreateCategory,
    validateUpdateCategory,
} = require("../validators/categoryValidator");
const { authMiddleware, isStaffOrAdmin } = require("../middlewares/authMiddleware");

router.get("/categories", categoryController.getAllCategories);
router.get(
    "/categories/:id",
    validateCategoryIdParam,
    categoryController.getCategoryById,
);

router.post(
    "/categories",
    authMiddleware,
    isStaffOrAdmin,
    validateCreateCategory,
    categoryController.createCategory,
);

router.put(
    "/categories/:id",
    authMiddleware,
    isStaffOrAdmin,
    validateCategoryIdParam,
    validateUpdateCategory,
    categoryController.updateCategory,
);

router.delete(
    "/categories/:id",
    authMiddleware,
    isStaffOrAdmin,
    validateCategoryIdParam,
    categoryController.deleteCategory,
);

module.exports = router;
