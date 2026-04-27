/**
 * Updated by trungquandev.com's author on Sep 27 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 * NOTE: (Muốn hiểu rõ hơn về code trong file này thì vui lòng xem video 55 trong bộ MERN Stack trên kênh Youtube của mình.)
 */

/* eslint-disable no-unused-vars */
const { StatusCodes } = require("http-status-codes");
// import { env } from '~/config/environment'

// Middleware xử lý lỗi tập trung trong ứng dụng Back-end NodeJS (ExpressJS)
const errorHandlingMiddleware = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const isInvalidJson = err && err.type === "entity.parse.failed";
    const statusCode = isInvalidJson
        ? StatusCodes.BAD_REQUEST
        : err.statusCode || err.status || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = isInvalidJson
        ? "Invalid JSON payload"
        : err.message || "Internal server error";

    const responseError = {
        message,
    };

    if (process.env.NODE_ENV !== "production") {
        responseError.statusCode = statusCode;
        responseError.stack = err.stack;
    }

    return res.status(statusCode).json(responseError);
};

module.exports = {
    errorHandlingMiddleware,
};
