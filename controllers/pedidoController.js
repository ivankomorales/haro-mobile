const Pedido = require("../models/Pedido");
const Counter = require("../models/Counter");

// CREATE
const crearPedido = async (req, res) => {
  // Obtener número de orden  
  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "pedido" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const folio = `ORD-${String(counter.seq).padStart(4, "0")}`;

    const nuevoPedido = new Pedido({
      ...req.body,
      orderID: folio,
    });

    const guardado = await nuevoPedido.save();
    res.status(201).json(guardado);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error al crear pedido", detalles: err.message });
  }
};

// READ (todos)
const obtenerPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
};

// READ (uno)
const obtenerPedidoPorId = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ error: "Error al buscar pedido" });
  }
};

// UPDATE
const actualizarPedido = async (req, res) => {
  try {
    const actualizado = await Pedido.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!actualizado)
      return res.status(404).json({ error: "Pedido no encontrado" });
    res.json(actualizado);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar" });
  }
};

// DELETE
const eliminarPedido = async (req, res) => {
  try {
    const eliminado = await Pedido.findByIdAndDelete(req.params.id);
    if (!eliminado)
      return res.status(404).json({ error: "Pedido no encontrado" });
    res.json({ mensaje: "Pedido eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar" });
  }
};

module.exports = {
  crearPedido,
  obtenerPedidos,
  obtenerPedidoPorId,
  actualizarPedido,
  eliminarPedido,
};
