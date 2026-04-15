const bcrypt = require("bcryptjs");

const {
  clearPasswordResetOtp,
  clearUserRefreshToken,
  createUser,
  findUserByEmail,
  findUserById,
  storePasswordResetOtp,
  updateUserPassword,
  updateUserRefreshToken,
} = require("../models/userModel");
const { sendPasswordResetOtp } = require("../utils/mailer");
const { createOtpPayload, hashOtp, isOtpExpired } = require("../utils/otp");
const { rotateTokens, verifyRefreshToken } = require("../utils/token");

const SALT_ROUNDS = 10;

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;

  return error;
};

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const toPublicUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  const existingUser = findUserByEmail(email);
  if (existingUser) {
    throw createHttpError(409, "Email already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = createUser({
    fullName,
    email,
    phone,
    passwordHash,
    role: "customer",
  });

  return res.status(201).json({
    userId: user.id,
    email: user.email,
    message: "Register successful",
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = findUserByEmail(email);
  if (!user) {
    throw createHttpError(404, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw createHttpError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = rotateTokens(user);
  updateUserRefreshToken(user.id, refreshToken);

  return res.status(200).json({
    accessToken,
    refreshToken,
    user: toPublicUser(user),
  });
});

const logout = asyncHandler(async (req, res) => {
  clearUserRefreshToken(req.user.id);

  return res.status(200).json({
    message: "Logged out",
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: incomingRefreshToken } = req.body;

  let payload;
  try {
    payload = verifyRefreshToken(incomingRefreshToken);
  } catch (error) {
    throw createHttpError(401, "Invalid or expired refresh token");
  }

  if (payload.type !== "refresh") {
    throw createHttpError(401, "Invalid or expired refresh token");
  }

  const user = findUserById(payload.sub);
  if (!user || !user.refreshToken || user.refreshToken !== incomingRefreshToken) {
    throw createHttpError(401, "Invalid or expired refresh token");
  }

  const tokens = rotateTokens(user);
  updateUserRefreshToken(user.id, tokens.refreshToken);

  return res.status(200).json(tokens);
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = findUserByEmail(email);
  if (!user) {
    throw createHttpError(404, "User not found");
  }

  const { otp, otpHash, expiresAt } = createOtpPayload();
  storePasswordResetOtp(user.id, {
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
    clearPasswordResetOtp(user.id);
    throw error;
  }

  return res.status(200).json({
    message: "OTP sent",
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = findUserByEmail(email);
  if (!user) {
    throw createHttpError(404, "User not found");
  }

  if (!user.resetOtpHash || !user.resetOtpExpiresAt) {
    throw createHttpError(400, "OTP is invalid or expired");
  }

  if (isOtpExpired(user.resetOtpExpiresAt)) {
    clearPasswordResetOtp(user.id);
    throw createHttpError(400, "OTP is invalid or expired");
  }

  if (hashOtp(otp) !== user.resetOtpHash) {
    throw createHttpError(400, "OTP is invalid or expired");
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  updateUserPassword(user.id, passwordHash);
  clearPasswordResetOtp(user.id);
  clearUserRefreshToken(user.id);

  return res.status(200).json({
    message: "Password reset",
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = findUserById(req.user.id);
  if (!user) {
    throw createHttpError(401, "Invalid or expired token");
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );
  if (!isCurrentPasswordValid) {
    throw createHttpError(401, "Current password is incorrect");
  }

  if (currentPassword === newPassword) {
    throw createHttpError(
      400,
      "New password must be different from current password"
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  updateUserPassword(user.id, passwordHash);
  clearUserRefreshToken(user.id);

  return res.status(200).json({
    message: "Changed",
  });
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
