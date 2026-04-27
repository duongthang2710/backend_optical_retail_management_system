const bcrypt = require("bcryptjs");

const {
    getUserByEmail,
    getUserById,
    createUser,
    updateUserRefreshToken,
    clearPasswordResetOtp,
    clearUserRefreshToken,
    storePasswordResetOtp,
    updateUserPassword,
} = require("./userService");
const { USER_ROLES } = require("../models/userModel");
const { sendPasswordResetOtp } = require("../utils/mailer");
const { createOtpPayload, hashOtp, isOtpExpired } = require("../utils/otp");
const { rotateTokens, verifyRefreshToken } = require("../utils/token");
const createHttpError = require("../utils/httpError");

const SALT_ROUNDS = 10;

const toPublicUser = (user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
});

const registerUser = async ({ fullName, email, phone, password }) => {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        throw createHttpError(409, "Email already exists");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser({
        fullName,
        email,
        phone,
        passwordHash,
        role: USER_ROLES.CUSTOMER,
    });

    return {
        userId: user.id,
        email: user.email,
        message: "Register successful",
    };
};

const loginUser = async ({ email, password }) => {
    const user = await getUserByEmail(email);
    if (!user) {
        throw createHttpError(404, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        throw createHttpError(401, "Invalid email or password");
    }

    const { accessToken, refreshToken } = rotateTokens(user);
    await updateUserRefreshToken(user.id, refreshToken);

    return {
        accessToken,
        refreshToken,
        user: toPublicUser(user),
    };
};

const logoutUser = async (userId) => {
    await clearUserRefreshToken(userId);

    return {
        message: "Logged out",
    };
};

const refreshUserToken = async (incomingRefreshToken) => {
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
    if (
        !user ||
        !user.refreshToken ||
        user.refreshToken !== incomingRefreshToken
    ) {
        throw createHttpError(401, "Invalid or expired refresh token");
    }

    const tokens = rotateTokens(user);
    await updateUserRefreshToken(user.id, tokens.refreshToken);

    return tokens;
};

const forgotPassword = async ({ email }) => {
    const user = await getUserByEmail(email);
    if (!user) {
        throw createHttpError(404, "User not found");
    }

    const { otp, otpHash, expiresAt } = createOtpPayload();
    await storePasswordResetOtp(user.id, {
        otpHash,
        expiresAt,
    });

    try {
        await sendPasswordResetOtp({
            email: user.email,
            fullName: user.fullName,
            otp,
        });
    } catch (error) {
        await clearPasswordResetOtp(user.id);
        throw error;
    }

    return {
        message: "OTP sent",
    };
};

const resetPassword = async ({ email, otp, newPassword }) => {
    const user = await getUserByEmail(email);
    if (!user) {
        throw createHttpError(404, "User not found");
    }

    if (!user.resetOtpHash || !user.resetOtpExpiresAt) {
        throw createHttpError(400, "OTP is invalid or expired");
    }

    if (isOtpExpired(user.resetOtpExpiresAt)) {
        await clearPasswordResetOtp(user.id);
        throw createHttpError(400, "OTP is invalid or expired");
    }

    if (hashOtp(otp) !== user.resetOtpHash) {
        throw createHttpError(400, "OTP is invalid or expired");
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await updateUserPassword(user.id, passwordHash);
    await clearPasswordResetOtp(user.id);
    await clearUserRefreshToken(user.id);

    return {
        message: "Password reset",
    };
};

const changePassword = async ({ userId, currentPassword, newPassword }) => {
    const user = await getUserById(userId);
    if (!user) {
        throw createHttpError(401, "Invalid or expired token");
    }

    const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash,
    );
    if (!isCurrentPasswordValid) {
        throw createHttpError(401, "Current password is incorrect");
    }

    if (currentPassword === newPassword) {
        throw createHttpError(
            400,
            "New password must be different from current password",
        );
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await updateUserPassword(user.id, passwordHash);
    await clearUserRefreshToken(user.id);

    return {
        message: "Changed",
    };
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshUserToken,
    forgotPassword,
    resetPassword,
    changePassword,
};
