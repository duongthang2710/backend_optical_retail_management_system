const discountService = require("../services/discountService");
const { sendResponse } = require("../utils/responseHandler");

class DiscountController {
    async getAllDiscounts(req, res, next) {
        try {
            const result = await discountService.getAll(req.query);
            return sendResponse(res, 200, "Get discounts successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async getDiscountById(req, res, next) {
        try {
            const result = await discountService.getById(req.params.id);
            return sendResponse(res, 200, "Get discount successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async createDiscount(req, res, next) {
        try {
            const created = await discountService.create(req.body);
            return sendResponse(
                res,
                201,
                "Discount created successfully",
                created,
            );
        } catch (error) {
            next(error);
        }
    }

    async updateDiscount(req, res, next) {
        try {
            const updated = await discountService.update(
                req.params.id,
                req.body,
            );
            return sendResponse(
                res,
                200,
                "Discount updated successfully",
                updated,
            );
        } catch (error) {
            next(error);
        }
    }

    async deleteDiscount(req, res, next) {
        try {
            await discountService.remove(req.params.id);
            return sendResponse(res, 200, "Discount deleted successfully");
        } catch (error) {
            next(error);
        }
    }

    async attachProduct(req, res, next) {
        try {
            const { id, productId } = req.params;
            const { created } = await discountService.attachProduct(
                id,
                productId,
            );
            return sendResponse(
                res,
                created ? 201 : 200,
                created ? "Product attached" : "Product already attached",
            );
        } catch (error) {
            next(error);
        }
    }

    async detachProduct(req, res, next) {
        try {
            const { id, productId } = req.params;
            await discountService.detachProduct(id, productId);
            return sendResponse(res, 200, "Product detached");
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DiscountController();
