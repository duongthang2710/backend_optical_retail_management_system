const bcrypt = require("bcryptjs");

const { getUserByEmail, getUserById } = require("./userService");
const { USER_ROLES, STAFF_OR_ADMIN_ROLES } = require("../models/userModel");
const { rotateTokens, verifyRefreshToken } = require("../utils/token");
const createHttpError = require("../utils/httpError");

class AdminService {
    toPublicAdmin(user) {
        return {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
        };
    }

    ensureAdmin(user) {
        if (!user || user.role !== USER_ROLES.ADMIN) {
            throw createHttpError(403, "Forbidden: Admins only");
        }
        if (user.isActive === false) {
            throw createHttpError(403, "Admin account is inactive");
        }
    }

    ensureStaffOrAdmin(user) {
        if (!user || !STAFF_OR_ADMIN_ROLES.includes(user.role)) {
            throw createHttpError(403, "Forbidden: Staff or Admins only");
        }
        if (user.isActive === false) {
            throw createHttpError(403, "Account is inactive");
        }
    }

    async loginAdmin({ email, password }) {
        const user = await getUserByEmail(email);
        if (!user) {
            throw createHttpError(404, "User not found");
        }

        this.ensureStaffOrAdmin(user);

        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash,
        );
        if (!isPasswordValid) {
            throw createHttpError(401, "Invalid email or password");
        }

        const { accessToken, refreshToken } = rotateTokens(user);

        return {
            accessToken,
            refreshToken,
            user: this.toPublicAdmin(user),
        };
    }

    async logoutAdmin(userId) {
        const user = await getUserById(userId);
        this.ensureStaffOrAdmin(user);

        return {
            message: "Logged out",
        };
    }

    async refreshAdminToken(incomingRefreshToken) {
        let payload;
        try {
            payload = verifyRefreshToken(incomingRefreshToken);
        } catch (error) {
            throw createHttpError(401, "Invalid or expired refresh token");
        }

        if (payload.type !== "refresh") {
            throw createHttpError(401, "Invalid or expired refresh token");
        }

        const user = await getUserById(payload.sub);
        this.ensureStaffOrAdmin(user);

        const tokens = rotateTokens(user);

        return {
            ...tokens,
            user: this.toPublicAdmin(user),
        };
    }

    async getAdminProfile(userId) {
        const user = await getUserById(userId);
        this.ensureStaffOrAdmin(user);

        return {
            user: this.toPublicAdmin(user),
        };
    }
}

module.exports = new AdminService();
