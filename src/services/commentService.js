const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const ApiError = require("../utils/ApiError");
const { ORDER_STATUS } = require("../models/orderModel");

const Comment = db.Comment;
const Order = db.Order;
const ProductOrder = db.ProductOrder;
const ProductVariant = db.ProductVariant;
const User = db.User;

class CommentService {
    async listByVariant(variantId, query) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Comment.findAndCountAll({
            where: { variant_id: variantId, is_active: true },
            limit,
            offset,
            order: [["comment_id", "DESC"]],
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["user_id", "user_name", "full_name"],
                },
            ],
        });

        return {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            comments: rows,
        };
    }

    async getById(id) {
        const comment = await Comment.findByPk(id, {
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["user_id", "user_name", "full_name"],
                },
            ],
        });
        if (!comment || comment.is_active === false) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found");
        }
        return comment;
    }

    async create(userId, payload) {
        const { variant_id, order_id, rate, desc } = payload;

        const variant = await ProductVariant.findByPk(variant_id);
        if (!variant) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Variant not found");
        }

        if (order_id) {
            const order = await Order.findOne({
                where: {
                    order_id,
                    user_id: userId,
                    status: ORDER_STATUS.DELIVERED,
                },
                include: [{ model: ProductOrder, as: "items" }],
            });
            if (!order) {
                throw new ApiError(
                    StatusCodes.BAD_REQUEST,
                    "Order not found or not delivered",
                );
            }
            const purchased = (order.items || []).some(
                (item) => Number(item.variant_id) === Number(variant_id),
            );
            if (!purchased) {
                throw new ApiError(
                    StatusCodes.BAD_REQUEST,
                    "This variant is not part of the given order",
                );
            }

            const existing = await Comment.findOne({
                where: {
                    user_id: userId,
                    order_id,
                    variant_id,
                    is_active: true,
                },
            });
            if (existing) {
                throw new ApiError(
                    StatusCodes.CONFLICT,
                    "You already commented on this item for this order",
                );
            }
        }

        const numericRate = Number(rate);
        if (!Number.isInteger(numericRate) || numericRate < 1 || numericRate > 5) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "rate must be an integer between 1 and 5",
            );
        }

        return Comment.create({
            variant_id,
            user_id: userId,
            order_id: order_id || null,
            rate: numericRate,
            desc: desc || null,
        });
    }

    async update(userId, commentId, payload) {
        const comment = await Comment.findByPk(commentId);
        if (!comment || comment.is_active === false) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found");
        }
        if (Number(comment.user_id) !== Number(userId)) {
            throw new ApiError(StatusCodes.FORBIDDEN, "Not your comment");
        }

        const updates = {};
        if (payload.rate !== undefined) {
            const r = Number(payload.rate);
            if (!Number.isInteger(r) || r < 1 || r > 5) {
                throw new ApiError(
                    StatusCodes.BAD_REQUEST,
                    "rate must be an integer between 1 and 5",
                );
            }
            updates.rate = r;
        }
        if (payload.desc !== undefined) {
            updates.desc = payload.desc;
        }

        if (Object.keys(updates).length === 0) {
            return comment;
        }

        await comment.update(updates);
        return comment;
    }

    async remove(userId, commentId, isAdminUser) {
        const comment = await Comment.findByPk(commentId);
        if (!comment || comment.is_active === false) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found");
        }
        if (!isAdminUser && Number(comment.user_id) !== Number(userId)) {
            throw new ApiError(StatusCodes.FORBIDDEN, "Not your comment");
        }

        await comment.update({ is_active: false });
        return true;
    }
}

module.exports = new CommentService();
