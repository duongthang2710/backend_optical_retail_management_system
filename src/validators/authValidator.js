const { body } = require("express-validator");

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const normalizeVietnamPhone = (value) => {
  const rawValue = String(value || "").trim().replace(/[\s.-]/g, "");

  if (rawValue.startsWith("+84")) {
    return `0${rawValue.slice(3)}`;
  }

  if (rawValue.startsWith("84")) {
    return `0${rawValue.slice(2)}`;
  }

  return rawValue;
};

const isVietnamMobilePhone = (value) => /^0(3|5|7|8|9)\d{8}$/.test(value);

const registerValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),
  body("email")
    .customSanitizer(normalizeEmail)
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Email must be valid"),
  body("phone")
    .customSanitizer(normalizeVietnamPhone)
    .notEmpty()
    .withMessage("Phone is required")
    .bail()
    .custom((value) => {
      if (!isVietnamMobilePhone(value)) {
        throw new Error("Phone must be a valid Vietnamese mobile number");
      }

      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Confirm password does not match");
      }

      return true;
    }),
];

const loginValidator = [
  body("email")
    .customSanitizer(normalizeEmail)
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Email must be valid"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

const refreshTokenValidator = [
  body("refreshToken")
    .trim()
    .notEmpty()
    .withMessage("Refresh token is required"),
];

const forgotPasswordValidator = [
  body("email")
    .customSanitizer(normalizeEmail)
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Email must be valid"),
];

const resetPasswordValidator = [
  body("email")
    .customSanitizer(normalizeEmail)
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Email must be valid"),
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .bail()
    .matches(/^\d{6}$/)
    .withMessage("OTP must be 6 digits"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .bail()
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters"),
];

const changePasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .bail()
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters"),
];

module.exports = {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
};
