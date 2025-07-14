require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");

const app = express();
connectDB();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Rutas base (provisional)
/* app.get("/", (req, res) => {
  res.send("API Haro Mobile funcionando");
}); */
const pedidoRoutes = require("./routes/pedidoRoutes");
app.use("/api/pedidos", pedidoRoutes);

// Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
