const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const ApiError = require("../utils/ApiError");

const CART_STATUS = "Cart";

const Order = db.Order;
const ProductOrder = db.ProductOrder;
const ProductVariant = db.ProductVariant;
const Product = db.Product;

class CartService {
    buildEmptyCart() {
        return {
            order_id: null,
            status: CART_STATUS,
            totalItems: 0,
            totalQuantity: 0,
            totalAmount: 0,
            items: [],
        };
    }

    formatCart(cartOrder) {
        if (!cartOrder) {
            return this.buildEmptyCart();
        }

        const items = (cartOrder.items || []).map((item) => {
            const variant = item.variant;
            const product = variant?.product;

            const quantity = Number(item.quantity || 0);
            const unitPrice = Number(
                item.price_at_purchase ?? variant?.price ?? 0,
            );
            const discountAmount = Number(item.discount_amount || 0);
            const lineTotal = Math.max(
                0,
                unitPrice * quantity - discountAmount,
            );

            return {
                variant_id: item.variant_id,
                product_id: variant?.product_id || null,
                product_name: product?.product_name || null,
                color: variant?.color || null,
                image: variant?.image || null,
                stock_quantity: Number(variant?.stock_quantity || 0),
                quantity,
                unit_price: unitPrice,
                discount_amount: discountAmount,
                line_total: lineTotal,
            };
        });

        const totalQuantity = items.reduce(
            (sum, item) => sum + Number(item.quantity || 0),
            0,
        );
        const totalAmount = items.reduce(
            (sum, item) => sum + Number(item.line_total || 0),
            0,
        );

        return {
            order_id: cartOrder.order_id,
            status: cartOrder.status,
            totalItems: items.length,
            totalQuantity,
            totalAmount,
            items,
        };
    }

    async getCartOrderByUserId(userId, transaction) {
        return Order.findOne({
            where: {
                user_id: userId,
                status: CART_STATUS,
            },
            transaction,
            order: [["order_id", "DESC"]],
        });
    }

    async getOrCreateCartOrder(userId, transaction) {
        let cartOrder = await this.getCartOrderByUserId(userId, transaction);

        if (!cartOrder) {
            cartOrder = await Order.create(
                {
                    user_id: userId,
                    status: CART_STATUS,
                    order_date: new Date(),
                },
                { transaction },
            );
        }

        return cartOrder;
    }

    async getCart(userId) {
        const cartOrder = await Order.findOne({
            where: {
                user_id: userId,
                status: CART_STATUS,
            },
            include: [
                {
                    model: ProductOrder,
                    as: "items",
                    attributes: [
                        "variant_id",
                        "order_id",
                        "price_at_purchase",
                        "quantity",
                        "discount_amount",
                    ],
                    include: [
                        {
                            model: ProductVariant,
                            as: "variant",
                            attributes: [
                                "variant_id",
                                "product_id",
                                "color",
                                "stock_quantity",
                                "image",
                                "price",
                            ],
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
            ],
            order: [
                [{ model: ProductOrder, as: "items" }, "variant_id", "ASC"],
            ],
        });

        return this.formatCart(cartOrder);
    }

    async ensureStock(variant, quantity) {
        const availableStock = Number(variant.stock_quantity || 0);
        if (quantity > availableStock) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                `Insufficient stock. Available: ${availableStock}`,
            );
        }
    }

    async addItem(userId, payload) {
        const trans = await db.sequelize.transaction();

        try {
            const variantId = Number(payload.variant_id);
            const requestedQuantity = Number(payload.quantity);

            const variant = await ProductVariant.findByPk(variantId, {
                transaction: trans,
            });
            if (!variant) {
                throw new ApiError(StatusCodes.NOT_FOUND, "Variant not found");
            }

            const cartOrder = await this.getOrCreateCartOrder(userId, trans);

            const existingItem = await ProductOrder.findOne({
                where: {
                    order_id: cartOrder.order_id,
                    variant_id: variantId,
                },
                transaction: trans,
            });

            if (existingItem) {
                const newQuantity =
                    Number(existingItem.quantity || 0) + requestedQuantity;
                await this.ensureStock(variant, newQuantity);

                await existingItem.update(
                    {
                        quantity: newQuantity,
                        price_at_purchase: Number(variant.price || 0),
                    },
                    { transaction: trans },
                );
            } else {
                await this.ensureStock(variant, requestedQuantity);

                await ProductOrder.create(
                    {
                        order_id: cartOrder.order_id,
                        variant_id: variantId,
                        quantity: requestedQuantity,
                        price_at_purchase: Number(variant.price || 0),
                        discount_amount: 0,
                    },
                    { transaction: trans },
                );
            }

            await trans.commit();
            return this.getCart(userId);
        } catch (error) {
            await trans.rollback();
            throw error;
        }
    }

    async updateItem(userId, variantId, payload) {
        const trans = await db.sequelize.transaction();

        try {
            const normalizedVariantId = Number(variantId);
            const newQuantity = Number(payload.quantity);

            const cartOrder = await this.getCartOrderByUserId(userId, trans);
            if (!cartOrder) {
                throw new ApiError(StatusCodes.NOT_FOUND, "Cart not found");
            }

            const existingItem = await ProductOrder.findOne({
                where: {
                    order_id: cartOrder.order_id,
                    variant_id: normalizedVariantId,
                },
                transaction: trans,
            });

            if (!existingItem) {
                throw new ApiError(
                    StatusCodes.NOT_FOUND,
                    "Cart item not found",
                );
            }

            if (newQuantity === 0) {
                await existingItem.destroy({ transaction: trans });
                await trans.commit();
                return this.getCart(userId);
            }

            const variant = await ProductVariant.findByPk(normalizedVariantId, {
                transaction: trans,
            });
            if (!variant) {
                throw new ApiError(StatusCodes.NOT_FOUND, "Variant not found");
            }

            await this.ensureStock(variant, newQuantity);

            await existingItem.update(
                {
                    quantity: newQuantity,
                    price_at_purchase: Number(variant.price || 0),
                },
                { transaction: trans },
            );

            await trans.commit();
            return this.getCart(userId);
        } catch (error) {
            await trans.rollback();
            throw error;
        }
    }

    async removeItem(userId, variantId) {
        const trans = await db.sequelize.transaction();

        try {
            const normalizedVariantId = Number(variantId);
            const cartOrder = await this.getCartOrderByUserId(userId, trans);

            if (!cartOrder) {
                throw new ApiError(StatusCodes.NOT_FOUND, "Cart not found");
            }

            const deletedRows = await ProductOrder.destroy({
                where: {
                    order_id: cartOrder.order_id,
                    variant_id: normalizedVariantId,
                },
                transaction: trans,
            });

            if (!deletedRows) {
                throw new ApiError(
                    StatusCodes.NOT_FOUND,
                    "Cart item not found",
                );
            }

            await trans.commit();
            return this.getCart(userId);
        } catch (error) {
            await trans.rollback();
            throw error;
        }
    }

    async clearCart(userId) {
        const trans = await db.sequelize.transaction();

        try {
            const cartOrder = await this.getCartOrderByUserId(userId, trans);
            if (!cartOrder) {
                await trans.commit();
                return this.buildEmptyCart();
            }

            await ProductOrder.destroy({
                where: {
                    order_id: cartOrder.order_id,
                },
                transaction: trans,
            });

            await cartOrder.destroy({ transaction: trans });

            await trans.commit();
            return this.buildEmptyCart();
        } catch (error) {
            await trans.rollback();
            throw error;
        }
    }
}

module.exports = new CartService();
