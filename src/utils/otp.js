const crypto = require("crypto");

const DEFAULT_OTP_EXPIRES_IN_MINUTES = 5;
const OTP_LENGTH = 6;

const getOtpExpiryMinutes = () => {
  const minutes = Number.parseInt(process.env.OTP_EXPIRES_IN_MINUTES, 10);

  if (Number.isInteger(minutes) && minutes > 0) {
    return minutes;
  }

  return DEFAULT_OTP_EXPIRES_IN_MINUTES;
};

const generateOtp = () => {
  return crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
};

const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
};

const createOtpPayload = () => {
  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + getOtpExpiryMinutes() * 60 * 1000);

  return {
    otp,
    otpHash,
    expiresAt,
  };
};

const isOtpExpired = (expiresAt) => {
  if (!expiresAt) {
    return true;
  }

  return new Date(expiresAt).getTime() <= Date.now();
};

module.exports = {
  generateOtp,
  hashOtp,
  createOtpPayload,
  getOtpExpiryMinutes,
  isOtpExpired,
};
