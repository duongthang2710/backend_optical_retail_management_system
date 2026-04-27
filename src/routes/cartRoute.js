const express = require("express");

const cartController = require("../controllers/cartController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
    validateVariantIdParam,
    validateAddCartItem,
    validateUpdateCartItem,
} = require("../validators/cartValidator");

const router = express.Router();

router.use(authMiddleware);

router.get("/", cartController.getCart);
router.post("/items", validateAddCartItem, cartController.addItem);
router.put(
    "/items/:variantId",
    validateVariantIdParam,
    validateUpdateCartItem,
    cartController.updateItem,
);
router.delete(
    "/items/:variantId",
    validateVariantIdParam,
    cartController.removeItem,
);
router.delete("/", cartController.clearCart);

module.exports = router;
