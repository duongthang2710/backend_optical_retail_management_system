const userRepository = require("../repositories/userRepository");

const getUserByEmail = async (email) => {
    return userRepository.findByEmail(email);
};

const getUserById = async (userId) => {
    return userRepository.findById(userId);
};

const createUser = async ({ fullName, email, phone, passwordHash, role }) => {
    return userRepository.create({
        fullName,
        email,
        phone,
        passwordHash,
        role,
    });
};

const updateUserRefreshToken = async (userId, refreshToken) => {
    return userRepository.updateRefreshToken(userId, refreshToken);
};

const clearUserRefreshToken = async (userId) => {
    return userRepository.clearRefreshToken(userId);
};

const storePasswordResetOtp = async (userId, payload) => {
    return userRepository.storePasswordResetOtp(userId, payload);
};

const clearPasswordResetOtp = async (userId) => {
    return userRepository.clearPasswordResetOtp(userId);
};

const updateUserPassword = async (userId, passwordHash) => {
    return userRepository.updatePassword(userId, passwordHash);
};

module.exports = {
    getUserByEmail,
    getUserById,
    createUser,
    updateUserRefreshToken,
    clearUserRefreshToken,
    storePasswordResetOtp,
    clearPasswordResetOtp,
    updateUserPassword,
};
