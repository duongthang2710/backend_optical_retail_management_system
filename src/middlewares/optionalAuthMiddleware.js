const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_ACCESS_SECRET;
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || JWT_SECRET);
            req.user = decoded;
        }
        catch (error) {
            req.user = null;
        }
    }
    else {
        req.user = null;
    }
    next();
}

module.exports = optionalAuth;