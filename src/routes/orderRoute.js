const express = require("express");

const orderController = require("../controllers/orderController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
    validateOrderIdParam,
    validateCheckout,
    validateUpdateStatus,
} = require("../validators/orderValidator");

const router = express.Router();

router.post(
    "/checkout",
    authMiddleware,
    validateCheckout,
    orderController.checkout,
);
router.get("/", authMiddleware, orderController.listMyOrders);
router.get(
    "/:id",
    authMiddleware,
    validateOrderIdParam,
    orderController.getMyOrder,
);
router.post(
    "/:id/cancel",
    authMiddleware,
    validateOrderIdParam,
    orderController.cancelMyOrder,
);

router.get(
    "/admin/all",
    authMiddleware,
    isAdmin,
    orderController.adminListAllOrders,
);
router.get(
    "/admin/:id",
    authMiddleware,
    isAdmin,
    validateOrderIdParam,
    orderController.adminGetOrder,
);
router.patch(
    "/admin/:id/status",
    authMiddleware,
    isAdmin,
    validateOrderIdParam,
    validateUpdateStatus,
    orderController.adminUpdateStatus,
);
router.patch(
    "/admin/:id/mark-paid",
    authMiddleware,
    isAdmin,
    validateOrderIdParam,
    orderController.adminMarkPaid,
);

module.exports = router;
