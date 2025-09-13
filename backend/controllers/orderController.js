const Order = require("../models/Order");
const Counter = require("../models/Counter");
const { findOrCreateCustomer } = require("./customerController");
const ApiError = require("../utils/ApiError");
const { logEvent } = require("../utils/audit");

// TODO: i18n TEXTS
// ---- status helpers (canonical + normalization) ----
const CANONICAL = new Set([
  "new",
  "pending",
  "inProgress",
  "completed",
  "cancelled",
]);

const LEGACY_MAP = {
  New: "new",
  Pending: "pending",
  "In Progress": "inProgress",
  in_progress: "inProgress",
  Completed: "completed",
  Cancelled: "cancelled",
};

function normalizeStatus(input) {
  if (!input) return undefined;
  const s = String(input);
  if (CANONICAL.has(s)) return s; // already canonical
  if (LEGACY_MAP[s]) return LEGACY_MAP[s]; // direct legacy map

  const clean = s.toLowerCase().replace(/[-_ ]+/g, "");
  if (clean === "inprogress") return "inProgress";
  if (clean === "new") return "new";
  if (clean === "pending") return "pending";
  if (clean === "completed") return "completed";
  if (clean === "cancelled") return "cancelled";
  return undefined;
}

// group used by your "pending" filter (new+pending+inProgress)
const PENDING_GROUP = ["new", "pending", "inProgress"];

// ---------------------------------------------
// 🟠 CREATE ORDER (POST /api/orders)
// ---------------------------------------------
const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const customer = await findOrCreateCustomer(req.body.customer, req);

    const counter = await Counter.findByIdAndUpdate(
      { _id: "order" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    // BEFORE:
    // const orderID = `ORD-${String(counter.seq).padStart(4, "0")}`;

    // AFTER:
    const seq = counter.seq; // e.g. 700
    const displayNumber = seq * 10; // -> 7000
    const orderID = `ORD#${displayNumber}`; // -> "ORD#7000"

    const allowedFields = [
      "status",
      "deposit",
      "notes",
      "products",
      "shipping",
      "orderDate",
      "deliverDate",
    ];
    const orderData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        orderData[field] = req.body[field];
      }
    }
    if (!orderData.orderDate) {
      orderData.orderDate = new Date(); // default to "today"
    }
    const newOrder = new Order({
      ...orderData,
      userId,
      customer: customer._id,
      orderID,
    });

    const saved = await newOrder.save();

    await logEvent({
      event: "order_created",
      objectId: saved._id,
      description: `Order ${orderID} created`,
      req,
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error creating order:", err);

    if (err.name === "ValidationError") {
      for (const field in err.errors) {
        console.error(`→ ${field}: ${err.errors[field].message}`);
      }
    }

    const message = err.message || "Unknown error";
    next(new ApiError(message, 500));
  }
}; // end createOrder

// ---------------------------------------------
// 🟢 GET ALL ORDERS (GET /api/orders)
// ---------------------------------------------
// OrderController.getOrders (reemplaza el método actual)
// comments in English only
const getOrders = async (req, res, next) => {
  try {
    // ------ pagination & sort ------
    const page = Math.max(parseInt(req.query.page, 10) || 0, 0);
    const limitRaw = parseInt(req.query.limit, 10) || 0;
    const limit = Math.min(Math.max(limitRaw, 0), 100); // 0 means "no limit" in legacy branch

    const sortParam = (req.query.sort || "orderDate:desc").trim();
    const [sortField, sortDir] = sortParam.split(":");
    const sortWhitelist = new Set([
      "orderDate",
      "createdAt",
      "total",
      "orderID",
    ]);
    const sort = sortWhitelist.has(sortField)
      ? { [sortField]: sortDir === "asc" ? 1 : -1 }
      : { orderDate: -1 };

    // ------ filters ------
    const filter = {};

    // allow selecting which date field to filter by
    const allowedDateFields = new Set([
      "orderDate",
      "deliverDate",
      "createdAt",
    ]);
    const dateField = allowedDateFields.has(req.query.dateField)
      ? req.query.dateField
      : "orderDate";

    // status group semantics unchanged
    const raw = req.query.status;
    if (raw && String(raw).toLowerCase() === "pending") {
      filter.status = { $in: PENDING_GROUP };
    } else if (raw) {
      const canon = normalizeStatus(raw);
      if (canon) filter.status = canon;
    }
    // normalize date range to [from 00:00, to+1day 00:00)
    if (req.query.from || req.query.to) {
      const dr = {};
      if (req.query.from) {
        const from = new Date(req.query.from);
        from.setHours(0, 0, 0, 0);
        dr.$gte = from;
      }
      if (req.query.to) {
        const to = new Date(req.query.to);
        to.setHours(0, 0, 0, 0);
        to.setDate(to.getDate() + 1);
        dr.$lt = to;
      }
      filter[dateField] = dr;
    }

    if (req.query.urgent === "true") filter.isUrgent = true;
    if (req.query.urgent === "false") filter.isUrgent = { $in: [false, null] };

    if (req.query.shipping === "true") filter["shipping.isRequired"] = true;
    if (req.query.shipping === "false")
      filter["shipping.isRequired"] = { $in: [false, null] };

    // quick count mode (kept)
    if (req.query.countOnly === "true") {
      const count = await Order.countDocuments(filter);
      return res.json({ count });
    }

    // ------ text query over orderID + customer fields ------
    const q = (req.query.q || "").trim();
    const hasQ = q.length > 0;
    const regex = hasQ
      ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
      : null;

    // ------ LEGACY BRANCH (no page) ------
    if (!page) {
      // keep existing behavior for Home "Recent Orders"
      const docs = await Order.find(
        hasQ
          ? {
              ...filter,
              $or: [{ orderID: regex }],
            }
          : filter
      )
        .populate("customer")
        .sort(sort)
        .limit(limit);

      // If you need q over customer.* in legacy, switch to aggregate; for Home it's fine.
      return res.json(docs);
    }

    // ------ PAGINATED BRANCH (returns { data, meta, stats? }) ------
    const baseMatch = filter;

    const pipeline = [{ $match: baseMatch }];

    pipeline.push(
      {
        $lookup: {
          from: "customers", // ensure your collection is named "customers"
          localField: "customer",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } }
    );

    if (hasQ) {
      pipeline.push({
        $match: {
          $or: [
            { orderID: regex },
            { "customer.name": regex },
            { "customer.lastName": regex },
            { "customer.email": regex },
          ],
        },
      });
    }

    // ------ SPECIAL SORT HANDLING (before $facet) ------
    // If sorting by "total", compute it first and then sort by that computed field.
    if (sortField === "total") {
      const sortAsc = sortDir === "asc" ? 1 : -1;

      // Compute total = sum(products.price) - deposit (coerce to numbers)
      pipeline.push({
        $addFields: {
          _subtotal: {
            $sum: {
              $map: {
                input: { $ifNull: ["$products", []] },
                as: "p",
                in: { $toDouble: { $ifNull: ["$$p.price", 0] } },
              },
            },
          },
          _deposit: { $toDouble: { $ifNull: ["$deposit", 0] } },
        },
      });
      pipeline.push({
        $addFields: { total: { $subtract: ["$_subtotal", "$_deposit"] } },
      });
      pipeline.push({ $sort: { total: sortAsc } });
    } else {
      // Default sort for whitelisted fields (orderDate, createdAt, orderID)
      pipeline.push({ $sort: sort });
    }

    // ------ FACET (pagination + total count) ------
    pipeline.push({
      $facet: {
        data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    });

    const agg = await Order.aggregate(pipeline);
    const data = agg[0]?.data || [];
    const totalDocs = agg[0]?.total?.[0]?.count || 0;
    const totalPages = Math.max(Math.ceil(totalDocs / limit), 1);

    let stats = undefined;
    if (req.query.includeStats === "true") {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const s = await Order.aggregate([
        { $match: { orderDate: { $gte: monthStart, $lt: monthEnd } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const by = Object.fromEntries(s.map((r) => [r._id, r.count]));
      stats = {
        month: {
          total: s.reduce((a, b) => a + b.count, 0),
          pending: (by.new || 0) + (by.pending || 0) + (by.inProgress || 0),
          shipped: by.completed || 0, // adjust if you have a dedicated "shipped"
          refunded: by.cancelled || 0, // adjust if you have a dedicated "refunded"
        },
      };
    }

    return res.json({
      data,
      meta: {
        page,
        limit,
        totalDocs,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        sort: { [sortField]: sort[sortField] === 1 ? "asc" : "desc" },
      },
      ...(stats ? { stats } : {}),
    });
  } catch (err) {
    console.error("getOrders error:", err);
    next(new ApiError("Error retrieving orders", 500));
  }
}; // end getOrders

// ---------------------------------------------
// 🟢 GET ORDER STATS (GET /api/orders/stats)
// ---------------------------------------------
const getOrderStats = async (req, res, next) => {
  try {
    // ---- date range parsing ----
    const range = String(req.query.range || "month").toLowerCase();
    const now = new Date();

    function startOfMonth(d) {
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    function startOfQuarter(d) {
      return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1);
    }
    function startOfYear(d) {
      return new Date(d.getFullYear(), 0, 1);
    }
    function addDays(d, n) {
      const x = new Date(d);
      x.setDate(x.getDate() + n);
      return x;
    }

    // Use [from, toExcl) window for $lt filtering
    let from = req.query.from ? new Date(req.query.from) : null;
    let toExcl = req.query.to ? new Date(req.query.to) : null;

    if (!from || !toExcl) {
      switch (range) {
        case "week": {
          const s = new Date(now);
          s.setHours(0, 0, 0, 0);
          from = addDays(s, -6); // last 7 days inclusive
          toExcl = addDays(new Date(s), 1); // today end (exclusive next day)
          break;
        }
        case "15d": {
          const s = new Date(now);
          s.setHours(0, 0, 0, 0);
          from = addDays(s, -14);
          toExcl = addDays(new Date(s), 1);
          break;
        }
        case "30d": {
          const s = new Date(now);
          s.setHours(0, 0, 0, 0);
          from = addDays(s, -29);
          toExcl = addDays(new Date(s), 1);
          break;
        }
        case "quarter": {
          const s = startOfQuarter(now);
          from = s;
          toExcl = new Date(s.getFullYear(), s.getMonth() + 3, 1);
          break;
        }
        case "year": {
          const s = startOfYear(now);
          from = s;
          toExcl = new Date(s.getFullYear() + 1, 0, 1);
          break;
        }
        case "all": {
          from = new Date(0);
          toExcl = addDays(new Date(now), 1);
          break;
        }
        case "month":
        default: {
          const s = startOfMonth(now);
          from = s;
          toExcl = new Date(s.getFullYear(), s.getMonth() + 1, 1);
          break;
        }
      }
    } else {
      // Normalize to [from 00:00, (to + 1 day) 00:00)
      from.setHours(0, 0, 0, 0);
      toExcl.setHours(0, 0, 0, 0);
      toExcl = addDays(toExcl, 1);
    }

    // Which date field to filter by (default orderDate)
    const allowedDateFields = new Set([
      "orderDate",
      "deliverDate",
      "createdAt",
    ]);
    const dateField = allowedDateFields.has(req.query.dateField)
      ? req.query.dateField
      : "orderDate";

    // ---- filters (mirror getOrders) ----
    const filter = {};
    // status or "pending" group
    const raw = req.query.status;
    if (raw && String(raw).toLowerCase() === "pending") {
      filter.status = { $in: PENDING_GROUP };
    } else if (raw) {
      const canon = normalizeStatus(raw);
      if (canon) filter.status = canon;
    }

    // date range
    filter[dateField] = { $gte: from, $lt: toExcl };

    // urgent
    if (req.query.urgent === "true") filter.isUrgent = true;
    if (req.query.urgent === "false") filter.isUrgent = { $in: [false, null] };

    // shipping (⚠️ use schema path)
    if (req.query.shipping === "true") filter["shipping.isRequired"] = true;
    if (req.query.shipping === "false")
      filter["shipping.isRequired"] = { $in: [false, null] };

    // text query over orderID + customer fields (lookup only if q is present)
    const q = (req.query.q || "").trim();
    const hasQ = q.length > 0;
    const regex = hasQ
      ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
      : null;

    // ---- aggregation ----
    const pipeline = [{ $match: filter }];

    if (hasQ) {
      pipeline.push(
        {
          $lookup: {
            from: "customers",
            localField: "customer",
            foreignField: "_id",
            as: "customer",
          },
        },
        { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
        {
          $match: {
            $or: [
              { orderID: regex },
              { "customer.name": regex },
              { "customer.lastName": regex },
              { "customer.email": regex },
            ],
          },
        }
      );
    }

    // Compute per-document subtotal & deposit (as numbers), then aggregate
    pipeline.push(
      {
        $project: {
          status: 1,
          _subtotal: {
            $sum: {
              $map: {
                input: { $ifNull: ["$products", []] },
                as: "p",
                in: { $toDouble: { $ifNull: ["$$p.price", 0] } },
              },
            },
          },
          _deposit: { $toDouble: { $ifNull: ["$deposit", 0] } },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "inProgress"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          gross: { $sum: "$_subtotal" },
          deposit: { $sum: "$_deposit" },
        },
      }
    );

    const agg = await Order.aggregate(pipeline);
    const r = agg?.[0] || {
      total: 0,
      new: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      gross: 0,
      deposit: 0,
    };

    const result = {
      range: {
        from: from.toISOString(),
        to: new Date(toExcl.getTime() - 1).toISOString(), // inclusive display
        dateField,
        label: range,
      },
      count: {
        total: r.total || 0,
        new: r.new || 0,
        pending: r.pending || 0,
        inProgress: r.inProgress || 0,
        completed: r.completed || 0,
        cancelled: r.cancelled || 0,
        pendingGroup: (r.new || 0) + (r.pending || 0) + (r.inProgress || 0),
      },
      totals: {
        gross: Math.round(r.gross || 0),
        deposit: Math.round(r.deposit || 0),
        net: Math.round((r.gross || 0) - (r.deposit || 0)),
      },
    };

    return res.json(result);
  } catch (err) {
    console.error("getOrderStats error:", err);
    next(new ApiError("Error retrieving order stats", 500));
  }
}; // end of getOrderStats

// ---------------------------------------------
// 🟢 GET ORDER BY ID (GET /api/orders/:id)
// ---------------------------------------------
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer")
      .populate("products.glazes.interior")
      .populate("products.glazes.exterior");

    if (!order) {
      return next(new ApiError("Order not found", 404));
    }

    res.json(order);
  } catch (err) {
    next(new ApiError("Error retrieving order", 500));
  }
}; // end getOrderById

// ---------------------------------------------
// 🟢 GET ORDERS BY USER (GET /api/orders/user/:userId)
// ---------------------------------------------
const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Order.find({ userId });
    res.json(orders);
  } catch (error) {
    console.error("Error getting orders by user:", error);
    res.status(500).json({ message: "Server error" });
  }
}; // end getOrdersByUser

// ---------------------------------------------
// 🟢 GET ORDERS BY STATUS (GET /api/orders/status/:status)
// ---------------------------------------------
const getOrdersByStatus = async (req, res) => {
  try {
    const canon = normalizeStatus(req.params.status);
    if (!canon) return res.status(400).json({ message: "Invalid status" });

    const orders = await Order.find({ status: canon });
    res.json(orders);
  } catch (error) {
    console.error("Error getting orders by status:", error);
    res.status(500).json({ message: "Server error" });
  }
}; // end getOrdersByStatus

// ---------------------------------------------
// 🔵 UPDATE ORDER (PUT /api/orders/:id)
// ---------------------------------------------
const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new ApiError("Order not found", 404));
    }

    const originalStatus = order.status;
    const allowedFields = [
      "status",
      "deposit",
      "notes",
      "products",
      "shipping",
      "orderDate",
      "deliverDate",
    ];

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        order[key] = req.body[key];
      }
    }

    await order.save();

    const changes = [];
    if (req.body.status && req.body.status !== originalStatus) {
      changes.push(`status: ${originalStatus} → ${req.body.status}`);
    }

    if (changes.length > 0) {
      await logEvent({
        event: "order_updated",
        objectId: order._id,
        description: `Order ${order.orderID} updated (${changes.join(", ")})`,
        req,
      });
    }

    res.json(order);
  } catch (err) {
    next(new ApiError("Error updating order", 500));
  }
}; // end updateOrder

// ---------------------------------------------
// 🟣 UPDATE ORDER STATUS ONLY (PATCH /api/orders/:id/status)
// ---------------------------------------------
const updateOrderStatus = async (req, res) => {
  try {
    const canon = normalizeStatus(req.body.status);
    const orderId = req.params.id;

    if (!canon) {
      return res
        .status(400)
        .json({ message: "Status is required and must be valid" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: canon },
      { new: true, runValidators: true }
    );

    if (!updatedOrder)
      return res.status(404).json({ message: "Order not found" });
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error" });
  }
}; // end updateOrderStatus

// ---------------------------------------------
// 🟣 BULK STATUS UPDATE (PATCH /api/orders/bulk-status)
// ---------------------------------------------
const updateManyOrderStatus = async (req, res) => {
  console.log("🟡 bulk status controller HIT");
  console.log("📦 Body recibido:", req.body);

  try {
    const { orderIds, newStatus } = req.body;
    const canon = normalizeStatus(newStatus);

    if (!Array.isArray(orderIds) || orderIds.length === 0 || !canon) {
      return res
        .status(400)
        .json({ message: "Missing orderIds or newStatus (invalid)" });
    }

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { status: canon } },
      { runValidators: true }
    );

    res.json({ message: "Bulk status update complete", result });
  } catch (error) {
    console.error(
      "❌ Error in bulk status update:",
      error.message,
      error.stack
    );
    res.status(500).json({ message: "Server error" });
  }
};
// end updateManyOrderStatus

// ---------------------------------------------
// 🟣 ADD ORDER NOTE (PATCH /api/orders/:id/notes)
// ---------------------------------------------
const addOrderNote = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ message: "Note is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.notes = note;

    await order.save();
    res.json(order);
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).json({ message: "Server error" });
  }
}; // end addOrderNote

// ---------------------------------------------
// 🔴 CANCEL ORDER (DELETE /api/orders/:id)
// ---------------------------------------------
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new ApiError("Order not found", 404));
    }

    order.status = "cancelled";
    await order.save();

    await logEvent({
      event: "order_cancelled",
      objectId: order._id,
      description: `Order ${order.orderID} cancelled`,
      req,
    });

    res.json({ message: "Order cancelled" });
  } catch (err) {
    next(new ApiError("Error cancelling order", 500));
  }
}; // end cancelOrder

// ---------------------------------------------
// 📦 EXPORT CONTROLLER METHODS
// ---------------------------------------------
module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersByUser,
  getOrderStats,
  getOrdersByStatus,
  updateOrder,
  updateOrderStatus,
  updateManyOrderStatus,
  addOrderNote,
  cancelOrder,
};
