const authService = require("../services/authService");

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const register = asyncHandler(async (req, res) => {
  const payload = await authService.registerUser(req.body);

  return res.status(201).json(payload);
});

const login = asyncHandler(async (req, res) => {
  const payload = await authService.loginUser(req.body);

  return res.status(200).json(payload);
});

const logout = asyncHandler(async (req, res) => {
  const payload = await authService.logoutUser(req.user.id);

  return res.status(200).json(payload);
});

const refreshToken = asyncHandler(async (req, res) => {
  const payload = await authService.refreshUserToken(req.body.refreshToken);

  return res.status(200).json(payload);
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
