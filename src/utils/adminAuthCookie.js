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

const getAdminRefreshTokenCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";
    const sameSite =
        process.env.REFRESH_TOKEN_COOKIE_SAME_SITE ||
        (isProduction ? "none" : "lax");

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite,
        path: "/admin",
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

module.exports = {
    REFRESH_TOKEN_COOKIE_NAME,
    getAdminRefreshTokenCookieOptions,
    getRefreshTokenFromRequest,
};
