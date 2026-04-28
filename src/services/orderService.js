const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const ApiError = require("../utils/ApiError");
const {
    ORDER_STATUS,
    PAYMENT_STATUS,
    PAYMENT_METHODS,
} = require("../models/orderModel");

const Order = db.Order;
const ProductOrder = db.ProductOrder;
const ProductVariant = db.ProductVariant;
const Product = db.Product;
const Address = db.Address;
const UserAddress = db.UserAddress;

const VALID_PAYMENT_METHODS = new Set(Object.values(PAYMENT_METHODS));

const NEXT_STATUS_BY_CURRENT = {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
};

const ORDER_INCLUDE = [
    {
        model: ProductOrder,
        as: "items",
        include: [
            {
                model: ProductVariant,
                as: "variant",
                include: [
                    {
                        model: Product,
                        as: "product",
                        attributes: ["product_id", "product_name"],
                    },
                ],
            },
        ],
    },
    { model: Address, as: "address" },
];

const formatOrder = (order) => {
    if (!order) return null;
    const plain = order.toJSON ? order.toJSON() : order;
    plain.items = (plain.items || []).map((item) => ({
        variant_id: item.variant_id,
        product_id: item.variant?.product_id || null,
        product_name: item.variant?.product?.product_name || null,
        color: item.variant?.color || null,
        image: item.variant?.image || null,
        price_at_purchase: Number(item.price_at_purchase || 0),
        quantity: Number(item.quantity || 0),
        discount_amount: Number(item.discount_amount || 0),
        line_total: Math.max(
            0,
            Number(item.price_at_purchase || 0) * Number(item.quantity || 0) -
                Number(item.discount_amount || 0),
        ),
    }));
    return plain;
};

class OrderService {
    async checkout(userId, payload) {
        const trans = await db.sequelize.transaction();
        try {
            const cartOrder = await Order.findOne({
                where: { user_id: userId, status: ORDER_STATUS.CART },
                include: [
                    {
                        model: ProductOrder,
                        as: "items",
                        include: [
                            {
                                model: ProductVariant,
                                as: "variant",
                            },
                        ],
                    },
                ],
                transaction: trans,
            });

            if (!cartOrder || (cartOrder.items || []).length === 0) {
                throw new ApiError(
                    StatusCodes.BAD_REQUEST,
                    "Cart is empty",
                );
            }

            const addressId = Number(payload.address_id);
            if (!Number.isInteger(addressId) || addressId <= 0) {
                throw new ApiError(
                    StatusCodes.BAD_REQUEST,
                    "address_id is required",
                );
            }

            const ownsAddress = await UserAddress.findOne({
                where: { user_id: userId, address_id: addressId },
                transaction: trans,
            });
            if (!ownsAddress) {
                throw new ApiError(
                    StatusCodes.BAD_REQUEST,
                    "Address does not belong to the user",
                );
            }

            const paymentMethod = payload.payment_method || PAYMENT_METHODS.COD;
            if (!VALID_PAYMENT_METHODS.has(paymentMethod)) {
                throw new ApiError(
                    StatusCodes.BAD_REQUEST,
                    "Invalid payment_method",
                );
            }

            let subtotal = 0;
            let discountTotal = 0;

            for (const item of cartOrder.items) {
                const variant = item.variant;
                if (!variant || variant.is_active === false) {
                    throw new ApiError(
                        StatusCodes.BAD_REQUEST,
                        `Variant ${item.variant_id} is unavailable`,
                    );
                }
                const requestedQty = Number(item.quantity || 0);
                if (requestedQty <= 0) {
                    throw new ApiError(
                        StatusCodes.BAD_REQUEST,
                        `Invalid quantity for variant ${item.variant_id}`,
                    );
                }
                if (Number(variant.stock_quantity || 0) < requestedQty) {
                    throw new ApiError(
                        StatusCodes.BAD_REQUEST,
                        `Insufficient stock for variant ${item.variant_id}`,
                    );
                }

                const unitPrice = Number(
                    item.price_at_purchase || variant.price || 0,
                );
                subtotal += unitPrice * requestedQty;
                discountTotal += Number(item.discount_amount || 0);

                await variant.update(
                    {
                        stock_quantity:
                            Number(variant.stock_quantity || 0) - requestedQty,
                    },
                    { transaction: trans },
                );

                if (item.price_at_purchase !== unitPrice) {
                    await ProductOrder.update(
                        { price_at_purchase: unitPrice },
                        {
                            where: {
                                order_id: cartOrder.order_id,
                                variant_id: variant.variant_id,
                            },
                            transaction: trans,
                        },
                    );
                }
            }

            const shippingFee = Number(payload.shipping_fee || 0);
            const totalAmount = Math.max(
                0,
                subtotal - discountTotal + shippingFee,
            );

            await cartOrder.update(
                {
                    status: ORDER_STATUS.PENDING,
                    address_id: addressId,
                    order_date: new Date(),
                    subtotal,
                    discount_total: discountTotal,
                    shipping_fee: shippingFee,
                    total_amount: totalAmount,
                    payment_method: paymentMethod,
                    payment_status: PAYMENT_STATUS.UNPAID,
                    note: payload.note || null,
                },
                { transaction: trans },
            );

            await trans.commit();
            return this.getMyOrderById(userId, cartOrder.order_id);
        } catch (error) {
            await trans.rollback();
            throw error;
        }
    }

    async listMyOrders(userId, query) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
        const offset = (page - 1) * limit;

        const where = { user_id: userId };
        where.status = { [db.Sequelize.Op.ne]: ORDER_STATUS.CART };
        if (query.status) {
            where.status = query.status;
        }

        const { count, rows } = await Order.findAndCountAll({
            where,
            limit,
            offset,
            order: [["order_id", "DESC"]],
            include: ORDER_INCLUDE,
            distinct: true,
        });

        return {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            orders: rows.map(formatOrder),
        };
    }

    async getMyOrderById(userId, orderId) {
        const order = await Order.findOne({
            where: {
                order_id: orderId,
                user_id: userId,
                status: { [db.Sequelize.Op.ne]: ORDER_STATUS.CART },
            },
            include: ORDER_INCLUDE,
        });
        if (!order) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
        }
        return formatOrder(order);
    }

    async cancelMyOrder(userId, orderId) {
        const trans = await db.sequelize.transaction();
        try {
            const order = await Order.findOne({
                where: { order_id: orderId, user_id: userId },
                include: [
                    {
                        model: ProductOrder,
                        as: "items",
                        include: [{ model: ProductVariant, as: "variant" }],
                    },
                ],
                transaction: trans,
            });

            if (!order || order.status === ORDER_STATUS.CART) {
                throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
            }

            if (
                ![ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(
                    order.status,
                )
            ) {
                throw new ApiError(
                    StatusCodes.BAD_REQUEST,
                    `Cannot cancel an order with status '${order.status}'`,
                );
            }

            for (const item of order.items || []) {
                if (item.variant) {
                    await item.variant.update(
                        {
                            stock_quantity:
                                Number(item.variant.stock_quantity || 0) +
                                Number(item.quantity || 0),
                        },
                        { transaction: trans },
                    );
                }
            }

            await order.update(
                { status: ORDER_STATUS.CANCELLED },
                { transaction: trans },
            );

            await trans.commit();
            return this.getMyOrderById(userId, orderId);
        } catch (error) {
            await trans.rollback();
            throw error;
        }
    }

    async listAllOrders(query) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
        const offset = (page - 1) * limit;

        const where = {};
        where.status = { [db.Sequelize.Op.ne]: ORDER_STATUS.CART };
        if (query.status) {
            where.status = query.status;
        }
        if (query.user_id) {
            where.user_id = query.user_id;
        }

        const { count, rows } = await Order.findAndCountAll({
            where,
            limit,
            offset,
            order: [["order_id", "DESC"]],
            include: ORDER_INCLUDE,
            distinct: true,
        });

        return {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            orders: rows.map(formatOrder),
        };
    }

    async adminGetOrderById(orderId) {
        const order = await Order.findOne({
            where: {
                order_id: orderId,
                status: { [db.Sequelize.Op.ne]: ORDER_STATUS.CART },
            },
            include: ORDER_INCLUDE,
        });
        if (!order) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
        }
        return formatOrder(order);
    }

    async adminUpdateStatus(orderId, payload) {
        const newStatus = payload.status;
        if (!newStatus) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "status is required");
        }

        const trans = await db.sequelize.transaction();
        try {
            const order = await Order.findByPk(orderId, {
                include: [
                    {
                        model: ProductOrder,
                        as: "items",
                        include: [{ model: ProductVariant, as: "variant" }],
                    },
                ],
                transaction: trans,
            });

            if (!order || order.status === ORDER_STATUS.CART) {
                throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
            }

            const allowedNext = NEXT_STATUS_BY_CURRENT[order.status] || [];
            if (!allowedNext.includes(newStatus)) {
                throw new ApiError(
                    StatusCodes.BAD_REQUEST,
                    `Cannot change status from '${order.status}' to '${newStatus}'`,
                );
            }

            if (newStatus === ORDER_STATUS.CANCELLED) {
                for (const item of order.items || []) {
                    if (item.variant) {
                        await item.variant.update(
                            {
                                stock_quantity:
                                    Number(item.variant.stock_quantity || 0) +
                                    Number(item.quantity || 0),
                            },
                            { transaction: trans },
                        );
                    }
                }
            }

            const updates = { status: newStatus };
            if (
                newStatus === ORDER_STATUS.DELIVERED &&
                order.payment_method === PAYMENT_METHODS.COD
            ) {
                updates.payment_status = PAYMENT_STATUS.PAID;
            }
            if (newStatus === ORDER_STATUS.CANCELLED) {
                updates.payment_status =
                    order.payment_status === PAYMENT_STATUS.PAID
                        ? PAYMENT_STATUS.REFUNDED
                        : PAYMENT_STATUS.UNPAID;
            }

            await order.update(updates, { transaction: trans });

            await trans.commit();
            return this.adminGetOrderById(orderId);
        } catch (error) {
            await trans.rollback();
            throw error;
        }
    }

    async adminMarkPaid(orderId) {
        const order = await Order.findByPk(orderId);
        if (!order || order.status === ORDER_STATUS.CART) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
        }
        await order.update({ payment_status: PAYMENT_STATUS.PAID });
        return this.adminGetOrderById(orderId);
    }
}

module.exports = new OrderService();
