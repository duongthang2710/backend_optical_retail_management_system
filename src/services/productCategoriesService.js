const db = require("../models");
const { Op, literal } = require("sequelize");
const ApiError = require("../utils/ApiError");
const statusCodes = require("http-status-codes").StatusCodes;

const Product = db.Product;
const ProductVariant = db.ProductVariant;
const Brand = db.Brand;
const Category = db.Category;
const Discount = db.Discount;
const Comment = db.Comment;

const SORT_OPTIONS = {
    newest: [["created_at", "DESC"]],
    oldest: [["created_at", "ASC"]],
    name_asc: [["product_name", "ASC"]],
    name_desc: [["product_name", "DESC"]],
    price_asc: [
        [
            literal(
                "(SELECT MIN(price) FROM Product_Variants pv WHERE pv.product_id = `Product`.`product_id` AND pv.is_active = TRUE)",
            ),
            "ASC",
        ],
    ],
    price_desc: [
        [
            literal(
                "(SELECT MAX(price) FROM Product_Variants pv WHERE pv.product_id = `Product`.`product_id` AND pv.is_active = TRUE)",
            ),
            "DESC",
        ],
    ],
};

const toNumberOrNull = (value) => {
    if (value === undefined || value === null || value === "") return null;
    const n = Number(value);
    return Number.isNaN(n) ? NaN : n;
};

const parseActive01 = (value) => {
    if (value === undefined) return undefined;
    if (value === 1 || value === 0) return Boolean(value);
    const normalized = String(value).trim();
    if (normalized === "1") return true;
    if (normalized === "0") return false;
    return undefined;
};

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const buildActiveDiscountWhere = () => {
    const today = getTodayDate();
    return {
        is_active: true,
        start_date: { [Op.lte]: today },
        end_date: { [Op.gte]: today },
    };
};

const pickActiveDiscount = (discounts) => {
    if (!Array.isArray(discounts) || discounts.length === 0) return null;
    const d = discounts[0];
    if (!d) return null;
    return {
        discount_id: d.discount_id,
        type_discount: d.type_discount,
        discount_value: Number(d.discount_value || 0),
        start_date: d.start_date,
        end_date: d.end_date,
        discount_number: d.discount_number ?? null,
        desc: d.desc ?? null,
    };
};

const withActiveDiscount = (product) => ({
    ...product,
    discount: pickActiveDiscount(product.discounts),
});

const computeAggregates = (product, ratingMap) => {
    const variants = (product.variants || []).filter(
        (v) => v.is_active !== false,
    );
    const prices = variants
        .map((v) => Number(v.price))
        .filter((p) => !Number.isNaN(p));
    const inStockCount = variants.reduce(
        (sum, v) => sum + Number(v.stock_quantity || 0),
        0,
    );
    const primaryImage = variants.find((v) => v.image)?.image || null;

    let totalRating = 0;
    let totalReviews = 0;
    for (const v of variants) {
        const stat = ratingMap.get(v.variant_id);
        if (stat) {
            totalRating += Number(stat.sum_rating || 0);
            totalReviews += Number(stat.total_reviews || 0);
        }
    }
    const avgRating =
        totalReviews > 0 ? Number((totalRating / totalReviews).toFixed(2)) : 0;

    return {
        min_price: prices.length ? Math.min(...prices) : null,
        max_price: prices.length ? Math.max(...prices) : null,
        total_stock: inStockCount,
        is_in_stock: inStockCount > 0,
        primary_image: primaryImage,
        avg_rating: avgRating,
        total_reviews: totalReviews,
    };
};

const withTryOnImageUrl = (product) => {
    const variants = Array.isArray(product.variants)
        ? product.variants.map((variant) => ({
              ...variant,
              tryOnImageUrl: variant.tryOnImageUrl || variant.image || null,
              tryOnModelUrl: variant.tryOnModelUrl || variant.image3d || null,
          }))
        : [];
    const tryOnImageUrl =
        variants.find((variant) => variant.tryOnImageUrl)?.tryOnImageUrl ||
        product.tryOnImageUrl ||
        product.primary_image ||
        null;
    const tryOnModelUrl =
        variants.find((variant) => variant.tryOnModelUrl)?.tryOnModelUrl ||
        product.tryOnModelUrl ||
        product.image3d ||
        null;

    return {
        ...product,
        variants,
        tryOnImageUrl,
        tryOnModelUrl,
    };
};

const loadRatingMap = async (variantIds) => {
    const ratingMap = new Map();
    if (!variantIds.length) return ratingMap;
    const stats = await Comment.findAll({
        attributes: [
            "variant_id",
            [db.sequelize.fn("SUM", db.sequelize.col("rate")), "sum_rating"],
            [
                db.sequelize.fn("COUNT", db.sequelize.col("comment_id")),
                "total_reviews",
            ],
        ],
        where: {
            variant_id: { [Op.in]: variantIds },
            is_active: true,
        },
        group: ["variant_id"],
        raw: true,
    });
    for (const row of stats) {
        ratingMap.set(Number(row.variant_id), {
            sum_rating: Number(row.sum_rating || 0),
            total_reviews: Number(row.total_reviews || 0),
        });
    }
    return ratingMap;
};

class ProductService {
    async getAllProducts(queryFilters) {
        const {
            keyword,
            q,
            material,
            shape,
            color,
            category_id,
            brand_id,
            sort,
        } = queryFilters;

        const page =
            Number(queryFilters.page) > 0 ? Number(queryFilters.page) : 1;
        const limit =
            Number(queryFilters.limit) > 0 ? Number(queryFilters.limit) : 20;

        const minPrice = toNumberOrNull(queryFilters.min_price);
        let maxPrice = toNumberOrNull(queryFilters.max_price);
        if (maxPrice === null) {
            maxPrice = toNumberOrNull(queryFilters.price);
        }

        if (
            (minPrice !== null && Number.isNaN(minPrice)) ||
            (maxPrice !== null && Number.isNaN(maxPrice))
        ) {
            throw new ApiError(
                statusCodes.BAD_REQUEST,
                "Price must be a valid number",
            );
        }
        if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
            throw new ApiError(
                statusCodes.BAD_REQUEST,
                "min_price must be <= max_price",
            );
        }

        const inStock =
            queryFilters.in_stock === "true" || queryFilters.in_stock === true;

        const order = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

        const productWhere = { is_active: true };
        if (category_id) productWhere.category_id = Number(category_id);
        if (brand_id) productWhere.brand_id = Number(brand_id);
        if (material) productWhere.material = { [Op.like]: `%${material}%` };
        if (shape) productWhere.shape = { [Op.like]: `%${shape}%` };

        const searchTerm = (q || keyword || "").toString().trim();
        if (searchTerm) {
            productWhere[Op.or] = [
                { product_name: { [Op.like]: `%${searchTerm}%` } },
                { "$brand.brand_name$": { [Op.like]: `%${searchTerm}%` } },
                {
                    "$category.category_name$": {
                        [Op.like]: `%${searchTerm}%`,
                    },
                },
            ];
        }

        const variantWhere = { is_active: true };
        if (color) variantWhere.color = { [Op.like]: `%${color}%` };
        if (minPrice !== null) {
            variantWhere.price = {
                ...(variantWhere.price || {}),
                [Op.gte]: minPrice,
            };
        }
        if (maxPrice !== null) {
            variantWhere.price = {
                ...(variantWhere.price || {}),
                [Op.lte]: maxPrice,
            };
        }
        if (inStock) variantWhere.stock_quantity = { [Op.gt]: 0 };

        const hasVariantFilter =
            Boolean(color) || minPrice !== null || maxPrice !== null || inStock;

        // Step 1: find matching product IDs (with pagination + filters + sort)
        const idQuery = await Product.findAndCountAll({
            attributes: ["product_id"],
            where: productWhere,
            include: [
                {
                    model: Brand,
                    as: "brand",
                    attributes: [],
                    required: Boolean(searchTerm) || Boolean(brand_id),
                },
                {
                    model: Category,
                    as: "category",
                    attributes: [],
                    required: Boolean(searchTerm) || Boolean(category_id),
                },
                {
                    model: ProductVariant,
                    as: "variants",
                    attributes: [],
                    where: variantWhere,
                    required: hasVariantFilter,
                },
            ],
            order,
            limit,
            offset: (page - 1) * limit,
            subQuery: false,
            group: ["Product.product_id"],
            col: "product_id",
        });

        const productIds = idQuery.rows.map((row) => row.product_id);
        const totalItems = Array.isArray(idQuery.count)
            ? idQuery.count.length
            : Number(idQuery.count || 0);

        if (productIds.length === 0) {
            return {
                totalItems,
                totalPages: Math.ceil(totalItems / limit) || 0,
                currentPage: page,
                products: [],
            };
        }

        // Step 2: load full data for those IDs (variants, brand, category)
        const fullProducts = await Product.findAll({
            where: { product_id: { [Op.in]: productIds } },
            include: [
                { model: Brand, as: "brand" },
                { model: Category, as: "category" },
                {
                    model: Discount,
                    as: "discounts",
                    through: { attributes: [] },
                    required: false,
                    where: buildActiveDiscountWhere(),
                    attributes: [
                        "discount_id",
                        "type_discount",
                        "discount_value",
                        "start_date",
                        "end_date",
                        "discount_number",
                        "desc",
                    ],
                },
                {
                    model: ProductVariant,
                    as: "variants",
                    where: { is_active: true },
                    required: false,
                    attributes: [
                        "variant_id",
                        "product_id",
                        "color",
                        "price",
                        "stock_quantity",
                        "image",
                        "image3d",
                        "is_active",
                    ],
                },
            ],
        });

        // Preserve sort order from step 1
        const productMap = new Map(
            fullProducts.map((p) => [Number(p.product_id), p]),
        );
        const orderedProducts = productIds
            .map((id) => productMap.get(Number(id)))
            .filter(Boolean);

        // Aggregate ratings
        const allVariantIds = orderedProducts.flatMap((p) =>
            (p.variants || []).map((v) => Number(v.variant_id)),
        );
        const ratingMap = await loadRatingMap(allVariantIds);

        const enriched = orderedProducts.map((p) => {
            const plain = p.toJSON ? p.toJSON() : p;
            const aggregated = {
                ...plain,
                ...computeAggregates(plain, ratingMap),
            };
            return withActiveDiscount(withTryOnImageUrl(aggregated));
        });

        return {
            totalItems,
            totalPages: Math.ceil(totalItems / limit) || 0,
            currentPage: page,
            filters: {
                keyword: searchTerm || null,
                material: material || null,
                shape: shape || null,
                color: color || null,
                category_id: category_id ? Number(category_id) : null,
                brand_id: brand_id ? Number(brand_id) : null,
                min_price: minPrice,
                max_price: maxPrice,
                in_stock: inStock,
                sort: sort || "newest",
            },
            products: enriched,
        };
    }

    async createProduct(productData) {
        const trans = await db.sequelize.transaction();
        try {
            const {
                product_name,
                category_id,
                brand_id,
                material,
                shape,
                desc,
                variants,
            } = productData;
            const newProduct = await Product.create(
                {
                    product_name,
                    category_id,
                    brand_id,
                    material,
                    shape,
                    desc,
                },
                { transaction: trans },
            );

            //thêm variant
            if (variants && variants.length > 0) {
                const variantWithId = variants.map((v) => {
                    const parsedActive = parseActive01(v.is_active);
                    return {
                        ...v,
                        product_id: newProduct.product_id,
                        ...(parsedActive !== undefined
                            ? { is_active: parsedActive }
                            : {}),
                    };
                });
                await ProductVariant.bulkCreate(variantWithId, {
                    transaction: trans,
                });
            }
            await trans.commit();
            return newProduct;
        } catch (error) {
            await trans.rollback();
            throw error;
        }
    }

    async getProductById(productId) {
        const product = await Product.findByPk(productId, {
            include: [
                { model: Brand, as: "brand" },
                { model: Category, as: "category" },
                {
                    model: Discount,
                    as: "discounts",
                    through: { attributes: [] },
                    required: false,
                    where: buildActiveDiscountWhere(),
                    attributes: [
                        "discount_id",
                        "type_discount",
                        "discount_value",
                        "start_date",
                        "end_date",
                        "discount_number",
                        "desc",
                    ],
                },
                {
                    model: ProductVariant,
                    as: "variants",
                    where: { is_active: true },
                    required: false,
                    attributes: [
                        "variant_id",
                        "product_id",
                        "color",
                        "price",
                        "stock_quantity",
                        "image",
                        "image3d",
                        "is_active",
                    ],
                },
            ],
        });
        if (!product) {
            throw new ApiError(statusCodes.NOT_FOUND, "Product not found");
        }

        const variantIds = (product.variants || []).map((v) =>
            Number(v.variant_id),
        );
        const ratingMap = await loadRatingMap(variantIds);
        const plain = product.toJSON();
        return withActiveDiscount(
            withTryOnImageUrl({
                ...plain,
                ...computeAggregates(plain, ratingMap),
            }),
        );
    }

    async getRelatedProducts(productId, limit = 8) {
        const product = await Product.findByPk(productId, {
            attributes: ["product_id", "category_id", "brand_id"],
        });
        if (!product) {
            throw new ApiError(statusCodes.NOT_FOUND, "Product not found");
        }

        const where = {
            is_active: true,
            product_id: { [Op.ne]: Number(productId) },
            [Op.or]: [],
        };
        if (product.category_id) {
            where[Op.or].push({ category_id: product.category_id });
        }
        if (product.brand_id) {
            where[Op.or].push({ brand_id: product.brand_id });
        }
        if (where[Op.or].length === 0) {
            delete where[Op.or];
        }

        const candidates = await Product.findAll({
            where,
            include: [
                { model: Brand, as: "brand" },
                { model: Category, as: "category" },
                {
                    model: Discount,
                    as: "discounts",
                    through: { attributes: [] },
                    required: false,
                    where: buildActiveDiscountWhere(),
                    attributes: [
                        "discount_id",
                        "type_discount",
                        "discount_value",
                        "start_date",
                        "end_date",
                        "discount_number",
                        "desc",
                    ],
                },
                {
                    model: ProductVariant,
                    as: "variants",
                    where: { is_active: true },
                    required: false,
                    attributes: [
                        "variant_id",
                        "product_id",
                        "color",
                        "price",
                        "stock_quantity",
                        "image",
                        "image3d",
                        "is_active",
                    ],
                },
            ],
            limit: Number(limit) > 0 ? Number(limit) : 8,
            order: [["created_at", "DESC"]],
        });

        const variantIds = candidates.flatMap((p) =>
            (p.variants || []).map((v) => Number(v.variant_id)),
        );
        const ratingMap = await loadRatingMap(variantIds);

        return candidates.map((p) => {
            const plain = p.toJSON();
            return withActiveDiscount(
                withTryOnImageUrl({
                    ...plain,
                    ...computeAggregates(plain, ratingMap),
                }),
            );
        });
    }

    async updateProduct(productId, updateData) {
        const trans = await db.sequelize.transaction();
        try {
            const product = await Product.findByPk(productId, {
                transaction: trans,
            });
            if (!product) {
                const error = new ApiError(
                    statusCodes.NOT_FOUND,
                    "Product not found",
                );
                throw error;
            }
            const {
                product_name,
                category_id,
                brand_id,
                material,
                shape,
                desc,
                variants,
            } = updateData;
            const productUpdatePayload = {};
            if (product_name !== undefined)
                productUpdatePayload.product_name = product_name;
            if (category_id !== undefined)
                productUpdatePayload.category_id = category_id;
            if (brand_id !== undefined)
                productUpdatePayload.brand_id = brand_id;
            if (material !== undefined)
                productUpdatePayload.material = material;
            if (shape !== undefined) productUpdatePayload.shape = shape;
            if (desc !== undefined) productUpdatePayload.desc = desc;

            // Cập nhật thông tin sản phẩm
            await product.update(productUpdatePayload, { transaction: trans });
            // Xử lý cập nhật variants
            if (variants && Array.isArray(variants)) {
                for (const item of variants) {
                    if (item.variant_id) {
                        const parsedActive = parseActive01(item.is_active);
                        const [affectedRows] = await ProductVariant.update(
                            {
                                color: item.color,
                                price: item.price,
                                stock_quantity: item.stock_quantity,
                                image: item.image,
                                image3d: item.image3d,
                                ...(parsedActive !== undefined
                                    ? { is_active: parsedActive }
                                    : {}),
                            },
                            {
                                where: {
                                    variant_id: item.variant_id,
                                    product_id: productId,
                                },
                                transaction: trans,
                            },
                        );
                        if (affectedRows === 0) {
                            const error = new ApiError(
                                statusCodes.NOT_FOUND,
                                `Variant with ID ${item.variant_id} not found for this product`,
                            );
                            throw error;
                        }
                    } else {
                        if (
                            !item.color ||
                            item.price === undefined ||
                            item.stock_quantity === undefined ||
                            !item.image
                        ) {
                            const error = new ApiError(
                                statusCodes.BAD_REQUEST,
                                "Missing required fields for new variant",
                            );
                            throw error;
                        }
                        const parsedActive = parseActive01(item.is_active);
                        await ProductVariant.create(
                            {
                                ...item,
                                product_id: productId,
                                ...(parsedActive !== undefined
                                    ? { is_active: parsedActive }
                                    : {}),
                            },
                            { transaction: trans },
                        );
                    }
                }
            }
            await trans.commit();
            return this.getProductById(productId);
        } catch (error) {
            await trans.rollback();
            throw error;
        }
    }
    async deleteProduct(productId) {
        const product = await Product.findByPk(productId);
        if (!product) {
            const error = new ApiError(
                statusCodes.NOT_FOUND,
                "Product not found",
            );
            throw error;
        }
        await ProductVariant.destroy({ where: { product_id: productId } });
        await product.destroy();
        return true;
    }
    async deleteVariant(variantId) {
        const variant = await ProductVariant.findByPk(variantId);
        if (!variant) {
            const error = new ApiError(
                statusCodes.NOT_FOUND,
                "Variant not found",
            );
            throw error;
        }
        if (!variant.is_active) {
            return true;
        }
        const activeCount = await ProductVariant.count({
            where: { product_id: variant.product_id, is_active: true },
        });
        if (activeCount <= 1) {
            const error = new ApiError(
                statusCodes.BAD_REQUEST,
                "At least one variant is required for a product",
            );
            throw error;
        }
        await variant.update({ is_active: false });
        return true;
    }
}

module.exports = new ProductService();
