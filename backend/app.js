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

app.use(express.json());

// ===================== CORS (multi-environment) =====================
const RAW = (
  process.env.CORS_ORIGINS ||
  // default values if you don’t set the env var
  "http://localhost:5173,https://haro-mobile-staging.vercel.app,https://haro-mobile.vercel.app,*.vercel.app"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowed(origin) {
  return RAW.some((p) => {
    if (p === "*") return true; // avoid using '*' if credentials=true
    if (p.startsWith("*.")) {
      const suf = p.slice(1); // ".vercel.app"
      return origin?.endsWith(suf);
    }
    return origin === p;
  });
}

const corsOptions = {
  origin(origin, cb) {
    // without 'origin' (Postman/cURL/SSR) → allow
    if (!origin) return cb(null, true);
    if (isAllowed(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true, // ✅ needed if you later use cookies. With Bearer tokens, it doesn’t hurt.
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // ✅
  allowedHeaders: ["authorization", "content-type"], // ✅ important for your preflight
};

app.use(cors(corsOptions)); // ✅ apply CORS globally
app.options("*", cors(corsOptions)); // ✅ respond to preflight OPTIONS for all routes
// ===================================================================

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

const orderDraftRoutes = require("./routes/orderDrafts");
app.use("/api/order-drafts", orderDraftRoutes);

const mePreferencesRoutes = require("./routes/mePreferences");
app.use("/api/me/preferences", mePreferencesRoutes);

// Healthcheck for Render
app.get("/healthz", (req, res) => res.status(200).json({ ok: true }));

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
