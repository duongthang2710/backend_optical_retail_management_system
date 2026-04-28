const commentService = require("../services/commentService");
const { sendResponse } = require("../utils/responseHandler");

class CommentController {
    async listByVariant(req, res, next) {
        try {
            const result = await commentService.listByVariant(
                req.params.variantId,
                req.query,
            );
            return sendResponse(res, 200, "Get comments successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const result = await commentService.getById(req.params.id);
            return sendResponse(res, 200, "Get comment successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async createComment(req, res, next) {
        try {
            const result = await commentService.create(req.user.id, req.body);
            return sendResponse(
                res,
                201,
                "Comment created successfully",
                result,
            );
        } catch (error) {
            next(error);
        }
    }

    async updateComment(req, res, next) {
        try {
            const result = await commentService.update(
                req.user.id,
                req.params.id,
                req.body,
            );
            return sendResponse(
                res,
                200,
                "Comment updated successfully",
                result,
            );
        } catch (error) {
            next(error);
        }
    }

    async deleteComment(req, res, next) {
        try {
            const isAdminUser = req.user && req.user.role === "admin";
            await commentService.remove(
                req.user.id,
                req.params.id,
                isAdminUser,
            );
            return sendResponse(res, 200, "Comment deleted successfully");
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CommentController();
