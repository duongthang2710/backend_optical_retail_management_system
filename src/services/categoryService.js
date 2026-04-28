const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const ApiError = require("../utils/ApiError");

const Category = db.Category;

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
        if (!category) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
        }
        return category;
    }

    async createCategory(payload) {
        const { category_name, desc } = payload;
        const newCategory = await Category.create({ category_name, desc });
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

        await category.update(updatePayload);
        return category;
    }

    async deleteCategory(id) {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
        }
        await category.destroy();
        return true;
    }
}

module.exports = new CategoryService();
