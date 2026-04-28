const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const ApiError = require("../utils/ApiError");

const Brand = db.Brand;

class BrandService {
    async getAllBrands(query) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
        const offset = (page - 1) * limit;

        const where = {};
        if (query.keyword) {
            where.brand_name = { [db.Sequelize.Op.like]: `%${query.keyword}%` };
        }

        const { count, rows } = await Brand.findAndCountAll({
            where,
            limit,
            offset,
            order: [["brand_id", "ASC"]],
        });

        return {
            totalItems: count,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page),
            brands: rows,
        };
    }

    async getBrandById(id) {
        const brand = await Brand.findByPk(id);
        if (!brand) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Brand not found");
        }
        return brand;
    }

    async createBrand(payload) {
        const { brand_name, desc } = payload;
        const newBrand = await Brand.create({ brand_name, desc });
        return newBrand;
    }

    async updateBrand(id, payload) {
        const brand = await Brand.findByPk(id);
        if (!brand) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Brand not found");
        }
        const updatePayload = {};
        if (payload.brand_name !== undefined)
            updatePayload.brand_name = payload.brand_name;
        if (payload.desc !== undefined) updatePayload.desc = payload.desc;

        await brand.update(updatePayload);
        return brand;
    }

    async deleteBrand(id) {
        const brand = await Brand.findByPk(id);
        if (!brand) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Brand not found");
        }
        await brand.destroy();
        return true;
    }
}

module.exports = new BrandService();
