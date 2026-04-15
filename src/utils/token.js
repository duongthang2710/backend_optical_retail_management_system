const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || "dev-access-secret";
const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
const createTokenId = () => crypto.randomBytes(16).toString("hex");

const createAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: "access",
      jti: createTokenId(),
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    }
  );
};

const createRefreshToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      type: "refresh",
      jti: createTokenId(),
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    }
  );
};

const verifyAccessToken = (token) => jwt.verify(token, ACCESS_TOKEN_SECRET);

const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_TOKEN_SECRET);

const rotateTokens = (user) => {
  return {
    accessToken: createAccessToken(user),
    refreshToken: createRefreshToken(user),
  };
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  rotateTokens,
};
