require("dotenv").config();
if (!process.env.JWT_SECRET) {
  console.error("❌ Error: JWT_SECRET not defined in .env");
  process.exit(1);
}

const errorHandler = require("./middleware/errorHandler");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");

const app = express();
connectDB();

// Middlewares
app.use(express.json());
app.use(cors({ origin: true, credentials: true })); // safer than app.use(cors())
app.use(helmet());
app.use(morgan("dev"));

// Base route
app.get("/", (req, res) => {
  res.send("Haro Mobile API is running");
});

// Routes
const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const glazeRoutes = require("./routes/glazeRoutes");
app.use("/api/glazes", glazeRoutes);

const customerRoutes = require("./routes/customerRoutes");
app.use("/api/customers", customerRoutes);

// 🛑 Catch all unknown routes
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// 🧯 Global Error Handler
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

module.exports = app;
