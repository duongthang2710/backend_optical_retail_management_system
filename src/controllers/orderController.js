const orderService = require("../services/orderService");
const { sendResponse } = require("../utils/responseHandler");

class OrderController {
    async checkout(req, res, next) {
        try {
            const result = await orderService.checkout(req.user.id, req.body);
            return sendResponse(res, 201, "Checkout successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async listMyOrders(req, res, next) {
        try {
            const result = await orderService.listMyOrders(
                req.user.id,
                req.query,
            );
            return sendResponse(res, 200, "Get orders successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async getMyOrder(req, res, next) {
        try {
            const result = await orderService.getMyOrderById(
                req.user.id,
                req.params.id,
            );
            return sendResponse(res, 200, "Get order successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async cancelMyOrder(req, res, next) {
        try {
            const result = await orderService.cancelMyOrder(
                req.user.id,
                req.params.id,
            );
            return sendResponse(res, 200, "Order cancelled", result);
        } catch (error) {
            next(error);
        }
    }

    async adminListAllOrders(req, res, next) {
        try {
            const result = await orderService.listAllOrders(req.query);
            return sendResponse(res, 200, "Get orders successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async adminGetOrder(req, res, next) {
        try {
            const result = await orderService.adminGetOrderById(req.params.id);
            return sendResponse(res, 200, "Get order successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async adminUpdateStatus(req, res, next) {
        try {
            const result = await orderService.adminUpdateStatus(
                req.params.id,
                req.body,
            );
            return sendResponse(res, 200, "Order status updated", result);
        } catch (error) {
            next(error);
        }
    }

    async adminMarkPaid(req, res, next) {
        try {
            const result = await orderService.adminMarkPaid(req.params.id);
            return sendResponse(
                res,
                200,
                "Order marked as paid",
                result,
            );
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new OrderController();
