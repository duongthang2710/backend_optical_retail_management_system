const authService = require("../services/authService");

const REFRESH_TOKEN_COOKIE_NAME =
    process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";

const parseDurationMs = (rawValue, fallbackMs) => {
    if (!rawValue) {
        return fallbackMs;
    }

    const normalizedValue = String(rawValue).trim();
    const durationMatch = normalizedValue.match(/^(\d+)(ms|s|m|h|d)?$/i);

    if (!durationMatch) {
        return fallbackMs;
    }

    const amount = Number(durationMatch[1]);
    const unit = (durationMatch[2] || "ms").toLowerCase();

    if (!Number.isFinite(amount) || amount <= 0) {
        return fallbackMs;
    }

    const unitToMs = {
        ms: 1,
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    return amount * unitToMs[unit];
};

const refreshCookieMaxAgeMs = parseDurationMs(
    process.env.REFRESH_TOKEN_EXPIRES_IN,
    7 * 24 * 60 * 60 * 1000,
);

const getRefreshTokenCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";
    const sameSite =
        process.env.REFRESH_TOKEN_COOKIE_SAME_SITE ||
        (isProduction ? "none" : "lax");

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite,
        path: "/auth",
        maxAge: refreshCookieMaxAgeMs,
    };
};

const parseCookies = (cookieHeader) => {
    const cookies = {};
    if (!cookieHeader) {
        return cookies;
    }

    const pairs = cookieHeader.split(";");
    for (const pair of pairs) {
        const separatorIndex = pair.indexOf("=");
        if (separatorIndex <= 0) {
            continue;
        }

        const key = pair.slice(0, separatorIndex).trim();
        const value = pair.slice(separatorIndex + 1).trim();
        if (!key) {
            continue;
        }

        cookies[key] = decodeURIComponent(value);
    }

    return cookies;
};

const getRefreshTokenFromRequest = (req) => {
    const cookies = parseCookies(req.headers.cookie || "");
    return cookies[REFRESH_TOKEN_COOKIE_NAME] || req.body?.refreshToken || null;
};

const asyncHandler = (handler) => (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
};

const register = asyncHandler(async (req, res) => {
    const payload = await authService.registerUser(req.body);

    return res.status(201).json(payload);
});

const login = asyncHandler(async (req, res) => {
    const payload = await authService.loginUser(req.body);

    res.cookie(
        REFRESH_TOKEN_COOKIE_NAME,
        payload.refreshToken,
        getRefreshTokenCookieOptions(),
    );

    const { refreshToken, ...responsePayload } = payload;

    return res.status(200).json(responsePayload);
});

const logout = asyncHandler(async (req, res) => {
    const payload = await authService.logoutUser(req.user.id);

    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
        ...getRefreshTokenCookieOptions(),
        maxAge: undefined,
    });

    return res.status(200).json(payload);
});

const refreshToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = getRefreshTokenFromRequest(req);
    if (!incomingRefreshToken) {
        return res.status(400).json({
            message: "Refresh token is required",
        });
    }

    const payload = await authService.refreshUserToken(incomingRefreshToken);

    res.cookie(
        REFRESH_TOKEN_COOKIE_NAME,
        payload.refreshToken,
        getRefreshTokenCookieOptions(),
    );

    const { refreshToken, ...responsePayload } = payload;

    return res.status(200).json(responsePayload);
});

const forgotPassword = asyncHandler(async (req, res) => {
    const payload = await authService.forgotPassword(req.body);

    return res.status(200).json(payload);
});

const resetPassword = asyncHandler(async (req, res) => {
    const payload = await authService.resetPassword(req.body);

    return res.status(200).json(payload);
});

const changePassword = asyncHandler(async (req, res) => {
    const payload = await authService.changePassword({
        userId: req.user.id,
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
    });

    return res.status(200).json(payload);
});

module.exports = {
    register,
    login,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    changePassword,
};
