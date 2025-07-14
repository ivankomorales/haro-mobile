const mongoose = require("mongoose");

const ProductoSchema = new mongoose.Schema({
  tipo: String,
  figuras: Number,
  precio: Number,
  descripcion: String,
  esmaltes: {
    interior: String,
    exterior: String,
  },
  adornos: {
    llevaOro: Boolean,
    llevaNombre: Boolean,
    descripcionAdorno: String,
  },
  imagenes: [String], // URLs o nombres de archivos
});

const PedidoSchema = new mongoose.Schema(
  {
    orderID: { type: String, unique: true, required: true },
    nombre: { type: String, required: true },
    telefono: String,
    correo: String,
    instagram: String,
    fechaEntrega: Date,
    estado: {
      type: String,
      enum: ["Pendiente", "En Proceso", "Completado", "Cancelado"],
      default: "Pendiente",
    },
    anticipo: { type: Number, default: 0 },
    envio: {
      requerido: { type: Boolean, default: false },
      direccion: String,
      ciudad: String,
      cp: String,
      telefono: String,
    },
    notas: String,
    productos: [ProductoSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pedido", PedidoSchema);
