const cartService = require("../services/cartService");
const { sendResponse } = require("../utils/responseHandler");

class CartController {
    async getCart(req, res, next) {
        try {
            const result = await cartService.getCart(req.user.id);
            return sendResponse(res, 200, "Get cart successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async addItem(req, res, next) {
        try {
            const result = await cartService.addItem(req.user.id, req.body);
            return sendResponse(
                res,
                200,
                "Add item to cart successfully",
                result,
            );
        } catch (error) {
            next(error);
        }
    }

    async updateItem(req, res, next) {
        try {
            const result = await cartService.updateItem(
                req.user.id,
                req.params.variantId,
                req.body,
            );
            return sendResponse(
                res,
                200,
                "Update cart item successfully",
                result,
            );
        } catch (error) {
            next(error);
        }
    }

    async removeItem(req, res, next) {
        try {
            const result = await cartService.removeItem(
                req.user.id,
                req.params.variantId,
            );
            return sendResponse(
                res,
                200,
                "Remove cart item successfully",
                result,
            );
        } catch (error) {
            next(error);
        }
    }

    async clearCart(req, res, next) {
        try {
            const result = await cartService.clearCart(req.user.id);
            return sendResponse(res, 200, "Clear cart successfully", result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CartController();
