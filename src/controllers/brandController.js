const brandService = require("../services/brandService");
const { sendResponse } = require("../utils/responseHandler");

class BrandController {
    async getAllBrands(req, res, next) {
        try {
            const result = await brandService.getAllBrands(req.query);
            return sendResponse(res, 200, "Get brands successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async getBrandById(req, res, next) {
        try {
            const result = await brandService.getBrandById(req.params.id);
            return sendResponse(res, 200, "Get brand successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async createBrand(req, res, next) {
        try {
            const newBrand = await brandService.createBrand(req.body);
            return sendResponse(res, 201, "Brand created successfully", {
                brand_id: newBrand.brand_id,
                brand_name: newBrand.brand_name,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateBrand(req, res, next) {
        try {
            const updated = await brandService.updateBrand(
                req.params.id,
                req.body,
            );
            return sendResponse(res, 200, "Brand updated successfully", {
                brand_id: updated.brand_id,
                brand_name: updated.brand_name,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteBrand(req, res, next) {
        try {
            await brandService.deleteBrand(req.params.id);
            return sendResponse(res, 200, "Brand deleted successfully");
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BrandController();
