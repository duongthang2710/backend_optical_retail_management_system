const { findUserById } = require("../models/userModel");
const { verifyAccessToken } = require("../utils/token");

const authMiddleware = (req, res, next) => {
  const authorizationHeader = req.headers.authorization || "";

  if (!authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization token is required",
    });
  }

  const token = authorizationHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({
      message: "Authorization token is required",
    });
  }

  try {
    const payload = verifyAccessToken(token);

    if (payload.type !== "access") {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    const user = findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    req.user = user;
    req.accessToken = token;

    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            message: "Forbidden: Admins only",
        });
    }
    next();
};

module.exports = {
    authMiddleware,
    isAdmin
};
