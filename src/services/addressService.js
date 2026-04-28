const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const ApiError = require("../utils/ApiError");

const Address = db.Address;
const UserAddress = db.UserAddress;

class AddressService {
    async listMyAddresses(userId) {
        const links = await UserAddress.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Address,
                    as: "address",
                    where: { is_active: true },
                    required: true,
                },
            ],
            order: [["address_id", "DESC"]],
        });

        return links.map((link) => link.address);
    }

    async getMyAddressById(userId, addressId) {
        const link = await UserAddress.findOne({
            where: { user_id: userId, address_id: addressId },
            include: [
                {
                    model: Address,
                    as: "address",
                    where: { is_active: true },
                    required: true,
                },
            ],
        });

        if (!link) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Address not found");
        }

        return link.address;
    }

    async createMyAddress(userId, payload) {
        const trans = await db.sequelize.transaction();
        try {
            const address = await Address.create(
                {
                    city: payload.city,
                    street: payload.street,
                    specifiable_address: payload.specifiable_address || null,
                },
                { transaction: trans },
            );

            await UserAddress.create(
                {
                    user_id: userId,
                    address_id: address.address_id,
                },
                { transaction: trans },
            );

            await trans.commit();
            return address;
        } catch (error) {
            await trans.rollback();
            throw error;
        }
    }

    async updateMyAddress(userId, addressId, payload) {
        const address = await this.getMyAddressById(userId, addressId);

        const updatePayload = {};
        if (payload.city !== undefined) updatePayload.city = payload.city;
        if (payload.street !== undefined) updatePayload.street = payload.street;
        if (payload.specifiable_address !== undefined) {
            updatePayload.specifiable_address = payload.specifiable_address;
        }

        if (Object.keys(updatePayload).length === 0) {
            return address;
        }

        await address.update(updatePayload);
        return address;
    }

    async deleteMyAddress(userId, addressId) {
        const address = await this.getMyAddressById(userId, addressId);
        await address.update({ is_active: false });
        return true;
    }
}

module.exports = new AddressService();
