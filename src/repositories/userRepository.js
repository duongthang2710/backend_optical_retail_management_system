const { User, normalizeEmail, USER_ROLES } = require("../models/userModel");

const toDomainUser = (dbUser) => {
    if (!dbUser) {
        return null;
    }

    return {
        id: dbUser.user_id,
        userName: dbUser.user_name,
        fullName: dbUser.full_name,
        email: dbUser.email,
        phone: dbUser.phone_number,
        role: dbUser.role,
        passwordHash: dbUser.password,
        resetOtpHash: dbUser.reset_otp_hash || null,
        resetOtpExpiresAt: dbUser.reset_otp_expires_at || null,
        isActive: dbUser.is_active,
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

const storePasswordResetOtp = async (userId, { otpHash, expiresAt }) => {
    const [updatedCount] = await User.update(
        {
            reset_otp_hash: otpHash,
            reset_otp_expires_at: expiresAt,
        },
        { where: { user_id: userId } },
    );

    if (!updatedCount) {
        return null;
    }

    return findById(userId);
};

const clearPasswordResetOtp = async (userId) => {
    const [updatedCount] = await User.update(
        {
            reset_otp_hash: null,
            reset_otp_expires_at: null,
        },
        { where: { user_id: userId } },
    );

    if (!updatedCount) {
        return null;
    }

    return findById(userId);
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
    storePasswordResetOtp,
    clearPasswordResetOtp,
    updatePassword,
};
