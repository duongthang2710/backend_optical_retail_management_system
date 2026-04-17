const productCategoriesService = require("../services/productCategoriesService");
const {sendResponse} = require("../utils/responseHandler");
class ProductController{
    async getAllProducts(req, res) {
        try {
            const result = await productCategoriesService.getAllProducts(req.query);
            return sendResponse(res, 200, "Get products successfully", result);
        }
        catch (error) {
            return sendResponse(res, 500, "Server error:" + error.message);
        }
    };
    async getProductById(req, res) {
        try {
            const result = await productCategoriesService.getProductById(req.params.productId);
            return sendResponse(res, 200, "Get product successfully", result);
        }
        catch (error) {
            next(error);
        }
    };
    async createProduct(req, res) {
        try {
            const newProduct = await productCategoriesService.createProduct(req.body);
            return sendResponse(res, 201, "Product created successfully", { product_name: newProduct.product_name });
        }
        catch (error) {
            return sendResponse(res, 500, "Server error:" + error.message);
        }
    };

}

module.exports = new ProductController();