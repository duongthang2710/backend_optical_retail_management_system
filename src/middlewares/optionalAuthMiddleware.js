const { verifyAccessToken } = require("../utils/token");

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = verifyAccessToken(token);
            req.user = decoded;
        } catch (error) {
            req.user = null;
        }
    } else {
        req.user = null;
    }
    next();
};

module.exports = { optionalAuth };
