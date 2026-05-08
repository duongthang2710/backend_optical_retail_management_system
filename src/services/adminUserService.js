const userRepository = require("../repositories/userRepository");
const { USER_ROLES } = require("../models/userModel");
const createHttpError = require("../utils/httpError");

const VALID_ROLES = Object.values(USER_ROLES);

const toPublicUser = (user) => ({
    id: user.id,
    userName: user.userName,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
});

class AdminUserService {
    async listUsers(query) {
        const filters = {
            role: query.role,
            q: query.q,
            page: query.page,
            limit: query.limit,
        };
        if (query.is_active !== undefined && query.is_active !== "") {
            filters.isActive =
                query.is_active === true || query.is_active === "true";
        }

        if (filters.role && !VALID_ROLES.includes(filters.role)) {
            throw createHttpError(
                400,
                `Invalid role. Allowed: ${VALID_ROLES.join(", ")}`,
            );
        }

        const result = await userRepository.listUsers(filters);
        return {
            ...result,
            users: result.users.map(toPublicUser),
        };
    }

    async getUser(userId) {
        const user = await userRepository.findById(userId);
        if (!user) throw createHttpError(404, "User not found");
        return toPublicUser(user);
    }

    async updateUserRole(actingAdminId, targetUserId, role) {
        if (!VALID_ROLES.includes(role)) {
            throw createHttpError(
                400,
                `Invalid role. Allowed: ${VALID_ROLES.join(", ")}`,
            );
        }
        if (Number(actingAdminId) === Number(targetUserId)) {
            throw createHttpError(
                400,
                "Admins cannot change their own role",
            );
        }

        const user = await userRepository.findById(targetUserId);
        if (!user) throw createHttpError(404, "User not found");

        const updated = await userRepository.updateRole(targetUserId, role);
        return toPublicUser(updated);
    }

    async setUserActiveStatus(actingAdminId, targetUserId, isActive) {
        if (Number(actingAdminId) === Number(targetUserId)) {
            throw createHttpError(
                400,
                "Admins cannot change their own active status",
            );
        }

        const user = await userRepository.findById(targetUserId);
        if (!user) throw createHttpError(404, "User not found");

        const updated = await userRepository.updateActiveStatus(
            targetUserId,
            Boolean(isActive),
        );
        return toPublicUser(updated);
    }
}

module.exports = new AdminUserService();
