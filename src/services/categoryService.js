const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const ApiError = require("../utils/ApiError");

const Category = db.Category;

const parseActive01 = (value) => {
    if (value === undefined) return undefined;
    if (value === 1 || value === 0) return Boolean(value);
    const normalized = String(value).trim();
    if (normalized === "1") return true;
    if (normalized === "0") return false;
    return undefined;
};

class CategoryService {
    async getAllCategories(query) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
        const offset = (page - 1) * limit;

        const where = {};
        if (query.keyword) {
            where.category_name = {
                [db.Sequelize.Op.like]: `%${query.keyword}%`,
            };
        }
        const includeInactive =
            String(query.include_inactive || "").trim() === "1";
        const requestedActive = parseActive01(query.is_active);
        if (requestedActive !== undefined) {
            where.is_active = requestedActive;
        } else if (!includeInactive) {
            where.is_active = true;
        }

        const { count, rows } = await Category.findAndCountAll({
            where,
            limit,
            offset,
            order: [["category_id", "ASC"]],
        });

        return {
            totalItems: count,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page),
            categories: rows,
        };
    }

    async getCategoryById(id) {
        const category = await Category.findByPk(id);
        if (!category || !category.is_active) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
        }
        return category;
    }

    async createCategory(payload) {
        const { category_name, desc, is_active } = payload;
        const parsedActive = parseActive01(is_active);
        const newCategory = await Category.create({
            category_name,
            desc,
            is_active: parsedActive !== undefined ? parsedActive : true,
        });
        return newCategory;
    }

    async updateCategory(id, payload) {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
        }
        const updatePayload = {};
        if (payload.category_name !== undefined)
            updatePayload.category_name = payload.category_name;
        if (payload.desc !== undefined) updatePayload.desc = payload.desc;
        if (payload.is_active !== undefined) {
            const parsedActive = parseActive01(payload.is_active);
            if (parsedActive !== undefined) {
                updatePayload.is_active = parsedActive;
            }
        }

        await category.update(updatePayload);
        return category;
    }

    async deleteCategory(id) {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
        }
        if (!category.is_active) {
            return true;
        }
        await category.update({ is_active: false });
        return true;
    }
}

module.exports = new CategoryService();
