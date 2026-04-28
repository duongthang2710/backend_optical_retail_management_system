const express = require("express");

const addressController = require("../controllers/addressController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
    validateAddressIdParam,
    validateCreateAddress,
    validateUpdateAddress,
} = require("../validators/addressValidator");

const router = express.Router();

router.use(authMiddleware);

router.get("/", addressController.listAddresses);
router.get("/:id", validateAddressIdParam, addressController.getAddress);
router.post("/", validateCreateAddress, addressController.createAddress);
router.put(
    "/:id",
    validateAddressIdParam,
    validateUpdateAddress,
    addressController.updateAddress,
);
router.delete("/:id", validateAddressIdParam, addressController.deleteAddress);

module.exports = router;
