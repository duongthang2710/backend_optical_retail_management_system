const productCategoriesService = require("../services/productCategoriesService");
const { sendResponse } = require("../utils/responseHandler");
class ProductController {
    async getAllProducts(req, res, next) {
        try {
            const result = await productCategoriesService.getAllProducts(
                req.query,
            );
            return sendResponse(res, 200, "Get products successfully", result);
        } catch (error) {
            next(error);
        }
    }
    async getProductById(req, res, next) {
        try {
            const result = await productCategoriesService.getProductById(
                req.params.productId,
            );
            return sendResponse(res, 200, "Get product successfully", result);
        } catch (error) {
            next(error);
        }
    }
    async getRelatedProducts(req, res, next) {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : 8;
            const result = await productCategoriesService.getRelatedProducts(
                req.params.productId,
                limit,
            );
            return sendResponse(
                res,
                200,
                "Get related products successfully",
                result,
            );
        } catch (error) {
            next(error);
        }
    }
    async createProduct(req, res, next) {
        try {
            const newProduct = await productCategoriesService.createProduct(
                req.body,
            );
            return sendResponse(res, 201, "Product created successfully", {
                product_name: newProduct.product_name,
            });
        } catch (error) {
            next(error);
        }
    }
    async updateProduct(req, res, next) {
        try {
            const productId = req.params.productId;
            const updateData = req.body;
            const updatedProduct = await productCategoriesService.updateProduct(
                productId,
                updateData,
            );
            return sendResponse(res, 200, "Product updated successfully", {
                product_name: updatedProduct.product_name,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteProduct(req, res, next) {
        try {
            const productId = req.params.productId;
            await productCategoriesService.deleteProduct(productId);
            return sendResponse(res, 200, "Product deleted successfully");
        } catch (error) {
            next(error);
        }
    }
    async deleteVariant(req, res, next) {
        try {
            const variantId = req.params.variantId;
            await productCategoriesService.deleteVariant(variantId);
            return sendResponse(res, 200, "Variant deleted successfully");
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ProductController();
