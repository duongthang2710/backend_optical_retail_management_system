const express = require("express");

const orderController = require("../controllers/orderController");
const { authMiddleware, isStaffOrAdmin } = require("../middlewares/authMiddleware");
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
    isStaffOrAdmin,
    orderController.adminListAllOrders,
);
router.get(
    "/admin/:id",
    authMiddleware,
    isStaffOrAdmin,
    validateOrderIdParam,
    orderController.adminGetOrder,
);
router.patch(
    "/admin/:id/status",
    authMiddleware,
    isStaffOrAdmin,
    validateOrderIdParam,
    validateUpdateStatus,
    orderController.adminUpdateStatus,
);
router.patch(
    "/admin/:id/mark-paid",
    authMiddleware,
    isStaffOrAdmin,
    validateOrderIdParam,
    orderController.adminMarkPaid,
);

module.exports = router;
