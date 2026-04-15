const crypto = require("crypto");

const usersById = new Map();
const emailToUserId = new Map();

const cloneUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    ...user,
  };
};

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const generateUserId = () => `usr_${crypto.randomBytes(8).toString("hex")}`;

const touchUser = (user) => {
  user.updatedAt = new Date();
};

const findUserByEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);
  const userId = emailToUserId.get(normalizedEmail);

  if (!userId) {
    return null;
  }

  return cloneUser(usersById.get(userId));
};

const findUserById = (userId) => {
  return cloneUser(usersById.get(userId));
};

const createUser = ({ fullName, email, phone, passwordHash, role = "customer" }) => {
  const normalizedEmail = normalizeEmail(email);
  const userId = generateUserId();
  const now = new Date();

  const user = {
    id: userId,
    fullName,
    email: normalizedEmail,
    phone,
    passwordHash,
    role,
    refreshToken: null,
    resetOtpHash: null,
    resetOtpExpiresAt: null,
    createdAt: now,
    updatedAt: now,
  };

  usersById.set(userId, user);
  emailToUserId.set(normalizedEmail, userId);

  return cloneUser(user);
};

const updateUserRefreshToken = (userId, refreshToken) => {
  const user = usersById.get(userId);
  if (!user) {
    return null;
  }

  user.refreshToken = refreshToken || null;
  touchUser(user);

  return cloneUser(user);
};

const clearUserRefreshToken = (userId) => updateUserRefreshToken(userId, null);

const storePasswordResetOtp = (userId, { otpHash, expiresAt }) => {
  const user = usersById.get(userId);
  if (!user) {
    return null;
  }

  user.resetOtpHash = otpHash;
  user.resetOtpExpiresAt = expiresAt;
  touchUser(user);

  return cloneUser(user);
};

const clearPasswordResetOtp = (userId) => {
  const user = usersById.get(userId);
  if (!user) {
    return null;
  }

  user.resetOtpHash = null;
  user.resetOtpExpiresAt = null;
  touchUser(user);

  return cloneUser(user);
};

const updateUserPassword = (userId, passwordHash) => {
  const user = usersById.get(userId);
  if (!user) {
    return null;
  }

  user.passwordHash = passwordHash;
  touchUser(user);

  return cloneUser(user);
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserRefreshToken,
  clearUserRefreshToken,
  storePasswordResetOtp,
  clearPasswordResetOtp,
  updateUserPassword,
};
