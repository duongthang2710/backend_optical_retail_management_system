require("dotenv").config({ quiet: true });

const cors = require("cors");
const express = require("express");
const morgan = require("morgan");

const authRoute = require("./src/routes/authRoute");
const productCategoriesRoute = require("./src/routes/productCategoriesRoute");
const {
    errorHandlingMiddleware,
} = require("./src/middlewares/errorHandlingMiddleware");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Optical retail management API is running",
    });
});

app.use("/auth", authRoute);
app.use("/", productCategoriesRoute);
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found",
    });
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err && err.type === "entity.parse.failed") {
        return res.status(400).json({
            message: "Invalid JSON payload",
        });
    }

    const statusCode = err.status || 500;
    const message = statusCode >= 500 ? "Internal server error" : err.message;

    if (statusCode >= 500) {
        console.error(err);
    }

    return res.status(statusCode).json({
        message,
    });
});

app.use(errorHandlingMiddleware);

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

module.exports = app;
