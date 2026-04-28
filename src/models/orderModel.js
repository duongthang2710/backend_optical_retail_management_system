const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const ORDER_STATUS = {
    CART: "Cart",
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    SHIPPING: "Shipping",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
};

const PAYMENT_STATUS = {
    UNPAID: "Unpaid",
    PAID: "Paid",
    REFUNDED: "Refunded",
};

const PAYMENT_METHODS = {
    COD: "COD",
    BANK_TRANSFER: "BankTransfer",
    MOMO: "MoMo",
    VNPAY: "VNPay",
};

const Order = sequelize.define(
    "Order",
    {
        order_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            field: "user_ID",
        },
        address_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: ORDER_STATUS.CART,
        },
        order_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        subtotal: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        shipping_fee: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        discount_total: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        total_amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        payment_method: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        payment_status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: PAYMENT_STATUS.UNPAID,
        },
        note: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "Orders",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
);

Order.associate = (models) => {
    if (models.ProductOrder) {
        Order.hasMany(models.ProductOrder, {
            foreignKey: "order_id",
            as: "items",
        });
    }
    if (models.User) {
        Order.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    }
    if (models.Address) {
        Order.belongsTo(models.Address, {
            foreignKey: "address_id",
            as: "address",
        });
    }
    if (models.Comment) {
        Order.hasMany(models.Comment, {
            foreignKey: "order_id",
            as: "comments",
        });
    }
};

module.exports = {
    Order,
    ORDER_STATUS,
    PAYMENT_STATUS,
    PAYMENT_METHODS,
};
