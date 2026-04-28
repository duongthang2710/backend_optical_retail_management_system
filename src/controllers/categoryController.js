const categoryService = require("../services/categoryService");
const { sendResponse } = require("../utils/responseHandler");

class CategoryController {
    async getAllCategories(req, res, next) {
        try {
            const result = await categoryService.getAllCategories(req.query);
            return sendResponse(
                res,
                200,
                "Get categories successfully",
                result,
            );
        } catch (error) {
            next(error);
        }
    }

    async getCategoryById(req, res, next) {
        try {
            const result = await categoryService.getCategoryById(req.params.id);
            return sendResponse(res, 200, "Get category successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async createCategory(req, res, next) {
        try {
            const newCategory = await categoryService.createCategory(req.body);
            return sendResponse(res, 201, "Category created successfully", {
                category_id: newCategory.category_id,
                category_name: newCategory.category_name,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateCategory(req, res, next) {
        try {
            const updated = await categoryService.updateCategory(
                req.params.id,
                req.body,
            );
            return sendResponse(res, 200, "Category updated successfully", {
                category_id: updated.category_id,
                category_name: updated.category_name,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteCategory(req, res, next) {
        try {
            await categoryService.deleteCategory(req.params.id);
            return sendResponse(res, 200, "Category deleted successfully");
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CategoryController();
