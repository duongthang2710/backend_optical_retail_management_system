const { User, normalizeEmail, USER_ROLES } = require("../models/userModel");

const refreshTokenByUserId = new Map();
const passwordResetOtpByUserId = new Map();

const toDomainUser = (dbUser) => {
    if (!dbUser) {
        return null;
    }

    const otpPayload = passwordResetOtpByUserId.get(dbUser.user_id);

    return {
        id: dbUser.user_id,
        userName: dbUser.user_name,
        fullName: dbUser.full_name,
        email: dbUser.email,
        phone: dbUser.phone_number,
        role: dbUser.role,
        passwordHash: dbUser.password,
        refreshToken: refreshTokenByUserId.get(dbUser.user_id) || null,
        resetOtpHash: otpPayload ? otpPayload.otpHash : null,
        resetOtpExpiresAt: otpPayload ? otpPayload.expiresAt : null,
    };
};

const createUserNameFromEmail = (email) => {
    return normalizeEmail(email).replace(/[^a-z0-9._-]/g, "_");
};

const ensureUniqueUserName = async (baseUserName) => {
    let candidate = baseUserName;
    let index = 1;

    while (await User.findOne({ where: { user_name: candidate } })) {
        candidate = `${baseUserName}_${index}`;
        index += 1;
    }

    return candidate;
};

const findByEmail = async (email) => {
    const dbUser = await User.findOne({
        where: { email: normalizeEmail(email) },
    });

    return toDomainUser(dbUser);
};

const findById = async (userId) => {
    const dbUser = await User.findByPk(userId);

    return toDomainUser(dbUser);
};

const create = async ({
    fullName,
    email,
    phone,
    passwordHash,
    role = USER_ROLES.CUSTOMER,
}) => {
    const normalizedEmail = normalizeEmail(email);
    const baseUserName = createUserNameFromEmail(normalizedEmail);
    const uniqueUserName = await ensureUniqueUserName(baseUserName);

    const dbUser = await User.create({
        user_name: uniqueUserName,
        password: passwordHash,
        full_name: fullName,
        email: normalizedEmail,
        phone_number: phone,
        role,
    });

    return toDomainUser(dbUser);
};

const updateRefreshToken = async (userId, refreshToken) => {
    const user = await findById(userId);
    if (!user) {
        return null;
    }

    if (refreshToken) {
        refreshTokenByUserId.set(userId, refreshToken);
    } else {
        refreshTokenByUserId.delete(userId);
    }

    return {
        ...user,
        refreshToken: refreshToken || null,
    };
};

const clearRefreshToken = async (userId) => {
    return updateRefreshToken(userId, null);
};

const storePasswordResetOtp = async (userId, { otpHash, expiresAt }) => {
    const user = await findById(userId);
    if (!user) {
        return null;
    }

    passwordResetOtpByUserId.set(userId, { otpHash, expiresAt });

    return {
        ...user,
        resetOtpHash: otpHash,
        resetOtpExpiresAt: expiresAt,
    };
};

const clearPasswordResetOtp = async (userId) => {
    const user = await findById(userId);
    if (!user) {
        return null;
    }

    passwordResetOtpByUserId.delete(userId);

    return {
        ...user,
        resetOtpHash: null,
        resetOtpExpiresAt: null,
    };
};

const updatePassword = async (userId, passwordHash) => {
    const [updatedCount] = await User.update(
        { password: passwordHash },
        { where: { user_id: userId } },
    );

    if (!updatedCount) {
        return null;
    }

    return findById(userId);
};

module.exports = {
    findByEmail,
    findById,
    create,
    updateRefreshToken,
    clearRefreshToken,
    storePasswordResetOtp,
    clearPasswordResetOtp,
    updatePassword,
};
