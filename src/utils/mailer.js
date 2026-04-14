const nodemailer = require("nodemailer");

const { getOtpExpiryMinutes } = require("./otp");

let transporter;

const getSmtpConfig = () => {
  const port = Number.parseInt(process.env.SMTP_PORT, 10);

  return {
    host: process.env.SMTP_HOST,
    port,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  };
};

const hasSmtpConfig = () => {
  const config = getSmtpConfig();

  return Boolean(
    config.host &&
      config.port &&
      config.user &&
      config.pass &&
      config.from
  );
};

const getTransporter = () => {
  if (!hasSmtpConfig()) {
    return null;
  }

  if (!transporter) {
    const config = getSmtpConfig();

    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  return transporter;
};

const sendPasswordResetOtp = async ({ email, fullName, otp }) => {
  if (!hasSmtpConfig()) {
    console.log(`[AUTH][OTP] Password reset OTP for ${email}: ${otp}`);
    return;
  }

  const config = getSmtpConfig();
  const client = getTransporter();
  const otpExpiryMinutes = getOtpExpiryMinutes();

  await client.sendMail({
    from: config.from,
    to: email,
    subject: "Password Reset OTP",
    text: `Hello ${fullName}, your OTP is ${otp}. It will expire in ${otpExpiryMinutes} minutes.`,
    html: `
      <p>Hello ${fullName},</p>
      <p>Your OTP is <strong>${otp}</strong>.</p>
      <p>It will expire in ${otpExpiryMinutes} minutes.</p>
    `,
  });
};

module.exports = {
  sendPasswordResetOtp,
};
