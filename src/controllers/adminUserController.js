const adminUserService = require("../services/adminUserService");
const { sendResponse } = require("../utils/responseHandler");

class AdminUserController {
    async listUsers(req, res, next) {
        try {
            const result = await adminUserService.listUsers(req.query);
            return sendResponse(res, 200, "Get users successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async getUser(req, res, next) {
        try {
            const result = await adminUserService.getUser(req.params.id);
            return sendResponse(res, 200, "Get user successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async updateUserRole(req, res, next) {
        try {
            const result = await adminUserService.updateUserRole(
                req.user.id,
                req.params.id,
                req.body.role,
            );
            return sendResponse(res, 200, "User role updated", result);
        } catch (error) {
            next(error);
        }
    }

    async setUserActiveStatus(req, res, next) {
        try {
            const result = await adminUserService.setUserActiveStatus(
                req.user.id,
                req.params.id,
                req.body.is_active,
            );
            return sendResponse(
                res,
                200,
                "User active status updated",
                result,
            );
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminUserController();
