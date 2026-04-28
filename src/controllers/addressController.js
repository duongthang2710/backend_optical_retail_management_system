const addressService = require("../services/addressService");
const { sendResponse } = require("../utils/responseHandler");

class AddressController {
    async listAddresses(req, res, next) {
        try {
            const result = await addressService.listMyAddresses(req.user.id);
            return sendResponse(res, 200, "Get addresses successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async getAddress(req, res, next) {
        try {
            const result = await addressService.getMyAddressById(
                req.user.id,
                req.params.id,
            );
            return sendResponse(res, 200, "Get address successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async createAddress(req, res, next) {
        try {
            const result = await addressService.createMyAddress(
                req.user.id,
                req.body,
            );
            return sendResponse(
                res,
                201,
                "Address created successfully",
                result,
            );
        } catch (error) {
            next(error);
        }
    }

    async updateAddress(req, res, next) {
        try {
            const result = await addressService.updateMyAddress(
                req.user.id,
                req.params.id,
                req.body,
            );
            return sendResponse(
                res,
                200,
                "Address updated successfully",
                result,
            );
        } catch (error) {
            next(error);
        }
    }

    async deleteAddress(req, res, next) {
        try {
            await addressService.deleteMyAddress(req.user.id, req.params.id);
            return sendResponse(res, 200, "Address deleted successfully");
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AddressController();
