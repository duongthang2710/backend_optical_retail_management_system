const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const ApiError = require("../utils/ApiError");

const Brand = db.Brand;

const parseActive01 = (value) => {
    if (value === undefined) return undefined;
    if (value === 1 || value === 0) return Boolean(value);
    const normalized = String(value).trim();
    if (normalized === "1") return true;
    if (normalized === "0") return false;
    return undefined;
};

class BrandService {
    async getAllBrands(query) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
        const offset = (page - 1) * limit;

        const where = {};
        if (query.keyword) {
            where.brand_name = { [db.Sequelize.Op.like]: `%${query.keyword}%` };
        }
        const includeInactive =
            String(query.include_inactive || "").trim() === "1";
        const requestedActive = parseActive01(query.is_active);
        if (requestedActive !== undefined) {
            where.is_active = requestedActive;
        } else if (!includeInactive) {
            where.is_active = true;
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
        if (!brand || !brand.is_active) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Brand not found");
        }
        return brand;
    }

    async createBrand(payload) {
        const { brand_name, desc, is_active } = payload;
        const parsedActive = parseActive01(is_active);
        const newBrand = await Brand.create({
            brand_name,
            desc,
            is_active: parsedActive !== undefined ? parsedActive : true,
        });
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
        if (payload.is_active !== undefined) {
            const parsedActive = parseActive01(payload.is_active);
            if (parsedActive !== undefined) {
                updatePayload.is_active = parsedActive;
            }
        }

        await brand.update(updatePayload);
        return brand;
    }

    async deleteBrand(id) {
        const brand = await Brand.findByPk(id);
        if (!brand) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Brand not found");
        }
        if (!brand.is_active) {
            return true;
        }
        await brand.update({ is_active: false });
        return true;
    }
}

module.exports = new BrandService();
