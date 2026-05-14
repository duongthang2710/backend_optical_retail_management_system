const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const db = require("../models");
const ApiError = require("../utils/ApiError");

const CART_STATUS = "Cart";

const Order = db.Order;
const ProductOrder = db.ProductOrder;
const ProductVariant = db.ProductVariant;
const Product = db.Product;
const Discount = db.Discount;
const ProductDiscount = db.ProductDiscount;

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const buildActiveDiscountWhere = () => {
    const today = getTodayDate();
    return {
        is_active: true,
        start_date: { [Op.lte]: today },
        end_date: { [Op.gte]: today },
    };
};

const normalizeDiscount = (discount) => {
    if (!discount) return null;
    return {
        discount_id: discount.discount_id,
        type_discount: discount.type_discount,
        discount_value: Number(discount.discount_value || 0),
        start_date: discount.start_date,
        end_date: discount.end_date,
        discount_number: discount.discount_number ?? null,
        desc: discount.desc ?? null,
    };
};

const computeDiscount = (unitPrice, quantity, discount) => {
    if (!discount) {
        return { discountedUnitPrice: unitPrice, discountAmount: 0 };
    }

    let perUnitDiscount = 0;
    if (discount.type_discount === "Percent") {
        perUnitDiscount = unitPrice * (discount.discount_value / 100);
    } else {
        perUnitDiscount = discount.discount_value;
    }

    perUnitDiscount = Math.max(0, Math.min(unitPrice, perUnitDiscount));
    const discountAmount = perUnitDiscount * quantity;
    return {
        discountedUnitPrice: Math.max(0, unitPrice - perUnitDiscount),
        discountAmount,
    };
};

const loadActiveDiscountMap = async (productIds, transaction) => {
    const map = new Map();
    if (!productIds.length) return map;

    const links = await ProductDiscount.findAll({
        where: { product_id: { [Op.in]: productIds } },
        include: [
            {
                model: Discount,
                as: "discount",
                required: true,
                where: buildActiveDiscountWhere(),
                attributes: [
                    "discount_id",
                    "type_discount",
                    "discount_value",
                    "start_date",
                    "end_date",
                    "discount_number",
                    "desc",
                ],
            },
        ],
        transaction,
    });

    for (const link of links) {
        if (!map.has(link.product_id)) {
            map.set(link.product_id, normalizeDiscount(link.discount));
        }
    }

    return map;
};

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

    formatCart(cartOrder, discountMap = new Map()) {
        if (!cartOrder) {
            return this.buildEmptyCart();
        }

        const items = (cartOrder.items || []).map((item) => {
            const variant = item.variant;
            const product = variant?.product;
            const productId = variant?.product_id || null;
            const discount = productId ? discountMap.get(productId) : null;

            const quantity = Number(item.quantity || 0);
            const basePrice = Number(
                item.price_at_purchase ?? variant?.price ?? 0,
            );
            const { discountedUnitPrice, discountAmount } = computeDiscount(
                basePrice,
                quantity,
                discount,
            );
            const lineTotal = Math.max(0, discountedUnitPrice * quantity);

            return {
                variant_id: item.variant_id,
                product_id: productId,
                product_name: product?.product_name || null,
                color: variant?.color || null,
                image: variant?.image || null,
                image3d: variant?.image3d || null,
                stock_quantity: Number(variant?.stock_quantity || 0),
                quantity,
                unit_price: discountedUnitPrice,
                original_price: basePrice,
                discount,
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
                                "image3d",
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
        const productIds = (cartOrder?.items || [])
            .map((item) => item.variant?.product_id)
            .filter(Boolean);
        const discountMap = await loadActiveDiscountMap(productIds);

        return this.formatCart(cartOrder, discountMap);
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
