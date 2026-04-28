require("dotenv").config({ quiet: true });

const cors = require("cors");
const express = require("express");
const morgan = require("morgan");

const authRoute = require("./src/routes/authRoute");
const adminRoute = require("./src/routes/adminRoute");
const cartRoute = require("./src/routes/cartRoute");
const productCategoriesRoute = require("./src/routes/productCategoriesRoute");
const categoryRoute = require("./src/routes/categoryRoute");
const brandRoute = require("./src/routes/brandRoute");
const {
    errorHandlingMiddleware,
} = require("./src/middlewares/errorHandlingMiddleware");
const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins.length ? allowedOrigins : true,
        credentials: true,
    }),
);
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Optical retail management API is running",
    });
});

app.use("/auth", authRoute);
app.use("/admin", adminRoute);
app.use("/cart", cartRoute);
app.use("/", productCategoriesRoute);
app.use("/", categoryRoute);
app.use("/", brandRoute);
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found",
    });
});

app.use(errorHandlingMiddleware);

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

module.exports = app;
