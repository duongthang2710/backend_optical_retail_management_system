const adminService = require("../services/adminService");
const { sendResponse } = require("../utils/responseHandler");
const {
    REFRESH_TOKEN_COOKIE_NAME,
    getAdminRefreshTokenCookieOptions,
    getRefreshTokenFromRequest,
} = require("../utils/adminAuthCookie");

class AdminController {
    async login(req, res, next) {
        try {
            const payload = await adminService.loginAdmin(req.body);

            res.cookie(
                REFRESH_TOKEN_COOKIE_NAME,
                payload.refreshToken,
                getAdminRefreshTokenCookieOptions(),
            );

            const { refreshToken, ...responsePayload } = payload;

            return sendResponse(
                res,
                200,
                "Admin login successfully",
                responsePayload,
            );
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            const payload = await adminService.logoutAdmin(req.user.id);

            res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
                ...getAdminRefreshTokenCookieOptions(),
                maxAge: undefined,
            });

            return sendResponse(res, 200, payload.message);
        } catch (error) {
            next(error);
        }
    }

    async refreshToken(req, res, next) {
        try {
            const incomingRefreshToken = getRefreshTokenFromRequest(req);
            if (!incomingRefreshToken) {
                return sendResponse(res, 400, "Refresh token is required");
            }

            const payload =
                await adminService.refreshAdminToken(incomingRefreshToken);

            res.cookie(
                REFRESH_TOKEN_COOKIE_NAME,
                payload.refreshToken,
                getAdminRefreshTokenCookieOptions(),
            );

            const { refreshToken, ...responsePayload } = payload;

            return sendResponse(
                res,
                200,
                "Refresh admin token successfully",
                responsePayload,
            );
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req, res, next) {
        try {
            const payload = await adminService.getAdminProfile(req.user.id);

            return sendResponse(
                res,
                200,
                "Get admin profile successfully",
                payload,
            );
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminController();
