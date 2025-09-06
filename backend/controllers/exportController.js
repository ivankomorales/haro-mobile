// src/controllers/exportController.js
const PDFDocument = require("pdfkit");
const Order = require("../models/Order");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const stream = require("stream");
const { promisify } = require("util");
const finished = promisify(stream.finished);
const ExcelJS = require("exceljs");

const PRODUCT_LABELS = {
  figure: "Figura",
  cup: "Taza",
  handmadeCup: "Taza a Mano",
  plate: "Platito",
  figurine: "Escultura",
};

const STATUS_LABELS = {
  new: "New",
  pending: "Pending",
  inProgress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function capitalize(word = "") {
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : "";
}

function getImageSrc(img) {
  // Accept both legacy strings and new object shape
  if (!img) return null;
  if (typeof img === "string") return img;
  if (typeof img === "object" && img.url) return img.url;
  return null;
}

async function loadImageBuffer(src) {
  if (!src) return null;
  try {
    if (src.startsWith("http")) {
      const res = await axios.get(src, {
        responseType: "arraybuffer",
        timeout: 8000,
        validateStatus: (s) => s >= 200 && s < 300, // only 2xx
      });
      const ct = res.headers?.["content-type"] || "";
      if (ct && !ct.startsWith("image/")) return null;
      return Buffer.from(res.data);
    }
    if (src.startsWith("data:image/")) {
      const base64 = src.split(",")[1] || "";
      return Buffer.from(base64, "base64");
    }
    // local path (optional)
    const abs = path.isAbsolute(src) ? src : path.join(process.cwd(), src);
    if (fs.existsSync(abs)) return fs.readFileSync(abs);
  } catch (_) {
    // swallow errors; skip broken image
  }
  return null;
}

// Measure text height using the same width/font you will draw with
function measureTextHeight(doc, text, width, font = "Helvetica", size = 12) {
  doc.save();
  doc.font(font).fontSize(size);
  const h = doc.heightOfString(text || "", { width });
  doc.restore();
  return h;
}

// Ensure there is enough vertical space for `needed`; add page otherwise
function ensureSpace(doc, needed, bottom, pageHeight) {
  // Use bottom margin in the check and reset y to the top margin
  if (doc.y + needed > pageHeight - bottom) {
    doc.addPage();
    doc.y = doc.page.margins.top;
  }
}

// Simple placeholder when an image is missing
function drawMissingPlaceholder(doc, x, y, w, h) {
  doc
    .save()
    .strokeColor("#d1d5db")
    .lineWidth(1)
    .rect(x, y, w, h)
    .stroke()
    .moveTo(x, y)
    .lineTo(x + w, y + h)
    .stroke()
    .moveTo(x + w, y)
    .lineTo(x, y + h)
    .stroke();
  doc.restore();
}

// Draw one row (up to two images), centered per cell; return actual row height used (0 if both fail)
// Accept optional preloaded buffers to avoid refetch
async function drawImageRow(
  doc,
  leftSrc,
  rightSrc,
  xLeft,
  xRight,
  y,
  cellW,
  cellH,
  pre = {} // { leftBuf, rightBuf }
) {
  const leftBuf =
    pre.leftBuf ?? (leftSrc ? await loadImageBuffer(leftSrc) : null);
  const rightBuf =
    pre.rightBuf ?? (rightSrc ? await loadImageBuffer(rightSrc) : null);

  function draw(buf, x) {
    if (!buf) return 0;
    doc.save();
    // clip to keep the image centered within the cell box
    doc.rect(x, y, cellW, cellH).clip();
    // preserve aspect ratio automatically
    doc.image(buf, x, y, {
      fit: [cellW, cellH],
      align: "center",
      valign: "center",
    });
    doc.restore();
    return cellH; // with `fit`, the drawn height never exceeds cellH
  }

  const hL = draw(leftBuf, xLeft);
  const hR = draw(rightBuf, xRight);
  return Math.max(hL, hR);
}

// Reserve block (subtitle + first row) and preload first-row buffers
async function ensureSubtitleAndFirstRowTogether(doc, images, layout) {
  const { top, bottom, pageH, cellH, subtitleText, contentW } = layout;

  // Measure subtitle height with the exact width that will be used when drawing
  const subtitleH = measureTextHeight(
    doc,
    subtitleText,
    contentW,
    "Helvetica",
    12
  );

  // Preload first-row buffers so we don't re-download them later
  const leftSrc = getImageSrc(images?.[0]);
  const rightSrc = getImageSrc(images?.[1]);
  const leftBuf = leftSrc ? await loadImageBuffer(leftSrc) : null;
  const rightBuf = rightSrc ? await loadImageBuffer(rightSrc) : null;

  // With PDFKit `fit`, a row height never exceeds cellH
  const firstRowH = leftBuf || rightBuf ? cellH : Math.floor(cellH * 0.6);

  // If the block doesn't fit, page-break first
  if (doc.y + subtitleH + firstRowH > pageH - bottom) {
    doc.addPage();
    doc.y = top;
  }
  return { leftBuf, rightBuf, firstRowH, subtitleH };
}

function drawOrderHeader(doc, order) {
  const fullName = [order.customer?.name, order.customer?.lastName]
    .filter(Boolean)
    .join(" ");
  const status = STATUS_LABELS[order.status] || "Unknown";
  const orderDate = new Date(
    order.orderDate || order.createdAt
  ).toLocaleDateString("es-MX");
  const deliverDate = order.deliverDate
    ? new Date(order.deliverDate).toLocaleDateString("es-MX")
    : "—";

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text(`${order.orderID || order._id}`);
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(fullName || "");

  if (order.notes) {
    doc.moveDown(0.2);
    doc.font("Helvetica").fontSize(12).text(order.notes, { width: 440 });
  }

  doc.moveDown(0.4);
  // If you want dates/status, uncomment and keep it compact:
  // doc
  //   .font("Helvetica")
  //   .fontSize(10)
  //   .text(`Status: ${status}`)
  //   .text(`Order Date: ${orderDate}`)
  //   .text(`Deliver Date: ${deliverDate}`);

  if (order.isUrgent) {
    doc.moveDown(0.2);
    doc.fillColor("#dc2626").fontSize(10).text("URGENT");
    doc.fillColor("black");
  }
  doc.moveDown(0.8);
}

// Main controller: POST /api/orders/export/pdf  body: { orderIds: [] }
exports.exportOrdersToPDF = async (req, res) => {
  try {
    const { orderIds } = req.body || {};
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: "orderIds is required" });
    }

    const orders = await Order.find({ _id: { $in: orderIds } })
      .populate("customer")
      .sort({ orderDate: -1 });

    if (!orders.length) {
      return res.status(404).json({ error: "No orders found" });
    }

    // Create doc using one consistent margin and reuse it everywhere
    const margin = 40;
    const doc = new PDFDocument({ margin, size: "A4" });

    // Stream headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="orders.pdf"');

    // Pipe doc to response
    doc.pipe(res);

    // Layout constants (use real page margins)
    const pageW = doc.page.width;
    const pageH = doc.page.height;
    const mL = doc.page.margins.left;
    const mR = doc.page.margins.right;
    const mT = doc.page.margins.top;
    const mB = doc.page.margins.bottom;
    const spacing = 10;
    const contentW = pageW - mL - mR;
    const cellW = Math.floor((contentW - spacing) / 2);
    const cellH = cellW; // square cells (change if you prefer taller rows)

    // Optional: basic error handlers for the stream
    doc.on("error", (e) => {
      console.error("PDF error:", e);
      try {
        res.destroy(e);
      } catch {}
    });
    res.on("error", (e) => console.error("RES error:", e));

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      if (i > 0) doc.addPage();
      doc.y = mT;

      // Header
      drawOrderHeader(doc, order);

      // Products
      for (let j = 0; j < order.products.length; j++) {
        const p = order.products[j] || {};
        const typeLabel =
          PRODUCT_LABELS[p.type] || capitalize(p.type || "Product");
        const images = Array.isArray(p.images) ? p.images : [];

        // Build subtitle text exactly as it will be drawn (single line combined)
        const subtitleText = `${typeLabel} ${j + 1}: ${
          p.description || "(No description)"
        }`;

        // SPECIAL CASE: single image → make it fill the remaining page height
        if (images.length === 1) {
          // Measure subtitle and ensure we have enough space to make it worthwhile
          const subtitleH = measureTextHeight(
            doc,
            subtitleText,
            contentW,
            "Helvetica",
            12
          );
          const MIN_SINGLE_BLOCK = Math.max(cellH, 160); // avoid tiny leftover drawings
          if (doc.y + subtitleH + MIN_SINGLE_BLOCK > pageH - mB) {
            doc.addPage();
            doc.y = mT;
          }

          // Draw subtitle
          doc
            .font("Helvetica-Bold")
            .fontSize(12)
            .text(`${typeLabel} ${j + 1}:`, { continued: true })
            .font("Helvetica")
            .text(` ${p.description || "(No description)"}`, {
              width: contentW,
            });
          doc.moveDown(0.5);

          // Compute remaining height below the subtitle and draw the single image to fill it
          let remH = pageH - mB - doc.y;
          if (remH < 20) {
            // Guard: if basically no space left, push to next page
            doc.addPage();
            doc.y = mT;
            remH = pageH - mB - doc.y;
          }

          const x = mL;
          const y = doc.y;
          const src = getImageSrc(images[0]);
          const buf = await loadImageBuffer(src);

          if (buf) {
            doc.save();
            doc.rect(x, y, contentW, remH).clip();
            doc.image(buf, x, y, {
              fit: [contentW, remH],
              align: "center",
              valign: "center",
            });
            doc.restore();
          } else {
            drawMissingPlaceholder(doc, x, y, contentW, remH);
          }

          // Move to bottom and (if there are more products) start a new page
          doc.y = pageH - mB;
          if (j < order.products.length - 1) {
            doc.addPage();
            doc.y = mT;
          }

          // Skip the usual 2-column grid for this product
          continue;
        }

        // DEFAULT CASE: 2-column grid with proportional images
        // Reserve space for subtitle + first row, and preload first-row buffers
        const pre = await ensureSubtitleAndFirstRowTogether(doc, images, {
          top: mT,
          bottom: mB,
          pageH,
          cellH,
          subtitleText,
          contentW,
        });

        // Subtitle (draw with the same width you measured against)
        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .text(`${typeLabel} ${j + 1}:`, { continued: true })
          .font("Helvetica")
          .text(` ${p.description || "(No description)"}`, { width: contentW });
        doc.moveDown(0.5);

        // Grid: 2 columns, proportional images
        const xLeft = mL;
        const xRight = mL + cellW + spacing;

        let isFirstRow = true;
        for (let k = 0; k < images.length; k += 2) {
          // For the first row we already reserved space above
          if (!isFirstRow) ensureSpace(doc, cellH, mB, pageH);

          const y = doc.y;
          const leftSrc = getImageSrc(images[k]);
          const rightSrc = getImageSrc(images[k + 1]);

          const usedH = await drawImageRow(
            doc,
            leftSrc,
            rightSrc,
            xLeft,
            xRight,
            y,
            cellW,
            cellH,
            isFirstRow ? pre : undefined
          );

          doc.y = y + (usedH || Math.floor(cellH * 0.25)) + spacing;
          isFirstRow = false;
        }

        // Divider (isolate styles)
        if (doc.y < pageH - mB - 10) {
          doc.save();
          doc
            .moveTo(mL, doc.y)
            .lineTo(pageW - mR, doc.y)
            .strokeColor("#e5e7eb")
            .lineWidth(1)
            .stroke();
          doc.restore();
          doc.moveDown(0.6);
        }
      }
    }

    doc.end();
    await finished(res);
  } catch (err) {
    console.error("Error exporting PDF:", err);
    res.status(500).json({ error: "Failed to export PDF" });
  }
}; // end exportOrdersToPDF

// Main controller: POST /api/orders/export/xlsx  body: { orderIds: [] }
exports.exportOrdersToExcel = async (req, res) => {
  try {
    const { orderIds, fields } = req.body || {};
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: "orderIds is required" });
    }

    const orders = await Order.find({ _id: { $in: orderIds } })
      .populate("customer")
      .populate("products.glazes.interior")
      .populate("products.glazes.exterior")
      .sort({ orderDate: -1 })
      .lean();

    if (!orders.length) {
      return res.status(404).json({ error: "No orders found" });
    }

    // ---------- helpers ----------
    // Sanitize to XML-safe string (keeps \t \n \r). Prevents Excel "repair".
    const xmlSafe = (v) =>
      String(v ?? "").replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD]/g, "");
    const S = (v) => xmlSafe(v);
    const D = (d) => {
      if (!d) return null;
      const dt = new Date(d);
      return Number.isNaN(dt.getTime()) ? null : dt;
    };
    // Accept "#RRGGBB" or "RRGGBB" → returns "FFRRGGBB" (ARGB) or null
    const toARGB = (hex) => {
      if (!hex) return null;
      let h = String(hex).trim().replace(/^#/, "");
      // #abc -> #aabbcc
      if (/^[0-9a-fA-F]{3}$/.test(h)) {
        h = h
          .split("")
          .map((ch) => ch + ch)
          .join("");
      }
      if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
      return ("FF" + h).toUpperCase(); // ARGB
    };

    // Determines if an hex color is wether dark or light
    function isDarkColor(hex) {
      if (!hex) return false;

      // Limpia "#" si existe y expande 3 dígitos (#abc -> #aabbcc)
      let h = String(hex).trim().replace(/^#/, "");
      if (/^[0-9a-fA-F]{3}$/.test(h)) {
        h = h
          .split("")
          .map((ch) => ch + ch)
          .join("");
      }
      if (!/^[0-9a-fA-F]{6}$/.test(h)) return false;

      // Convierte hex -> RGB
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);

      // Luminancia relativa (perceptual, estándar WCAG)
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Si es < 0.5 => color oscuro
      return luminance < 0.5;
    }
    // Helper to join name + code as "Name (CODE)"
    function joinNameCode(name, code) {
      if (!name) return "";
      return code ? `${name} (${code})` : name;
    }

    // Extract glaze names/hex from multiple possible shapes
    function extractGlazes(p = {}, opts = {}) {
      const { productType, notApplicablePlaceholder = "" } = opts;

      // If you want to display "-" for non-applicable fields (e.g., interior on plates), adjust here:
      const NA_INTERIOR_TYPES = new Set(["plate"]); // <-- add the types where there's NO interior
      const NA_EXTERIOR_TYPES = new Set([]); // <-- if there are any types without exterior

      // Flexible access (depending on your different shapes)
      const g = p.glazes || {};
      const gi = g.interior || p.glazeInterior || p.interiorGlaze || null;
      const ge = g.exterior || p.glazeExterior || p.exteriorGlaze || null;

      // Safe helpers
      const pickString = (v) => (typeof v === "string" ? v : "");
      const pickName = (obj) => {
        if (!obj) return "";
        if (typeof obj === "string") return obj;
        if (typeof obj === "object") {
          return (
            pickString(obj.name) ||
            pickString(obj.label) ||
            pickString(obj.title) ||
            pickString(obj.slug)
          );
        }
        return "";
      };
      const pickHex = (obj) => {
        if (!obj) return "";
        if (typeof obj === "string") return obj; // in case the hex comes directly
        if (typeof obj === "object") {
          const raw =
            pickString(obj.hex) ||
            pickString(obj.color) ||
            pickString(obj.colorHex) ||
            pickString(obj.hexColor) ||
            pickString(obj.code);
          return raw;
        }
        return "";
      };
      const pickCode = (obj) => {
        if (!obj || typeof obj !== "object") return "";
        return pickString(obj.code);
      };

      // “Not applicable” (if you want a dash for NA; leave '' if you prefer empty)
      const interiorNA = NA_INTERIOR_TYPES.has(
        String(productType || "").trim()
      );
      const exteriorNA = NA_EXTERIOR_TYPES.has(
        String(productType || "").trim()
      );
      const interiorNameRaw = interiorNA
        ? notApplicablePlaceholder
        : pickName(gi);
      const interiorCode = interiorNA ? "" : pickCode(gi);
      const exteriorNameRaw = exteriorNA
        ? notApplicablePlaceholder
        : pickName(ge);
      const exteriorCode = exteriorNA ? "" : pickCode(ge);

      const glazeInteriorName = interiorNA
        ? notApplicablePlaceholder
        : joinNameCode(interiorNameRaw, interiorCode);
      const glazeExteriorName = exteriorNA
        ? notApplicablePlaceholder
        : joinNameCode(exteriorNameRaw, exteriorCode);

      const glazeInteriorHex = interiorNA
        ? notApplicablePlaceholder
        : pickHex(gi);
      const glazeExteriorHex = exteriorNA
        ? notApplicablePlaceholder
        : pickHex(ge);

      return {
        glazeInteriorName,
        glazeInteriorHex,
        glazeExteriorName,
        glazeExteriorHex,
      };
    }

    // ---------- rows (1 row per product; if none → 1 row per order) ----------
    const rows = [];
    for (const o of orders) {
      const base = {
        orderID: S(o.orderID || o._id),
        customerName: S(
          [o.customer?.name, o.customer?.lastName].filter(Boolean).join(" ")
        ),
        customerPhone: S(o.customer?.phone),
        customerEmail: S(o.customer?.email),
        status: S(o.status), // new | pending | inProgress | completed | cancelled
        isUrgent: !!o.isUrgent,
        orderDate: D(o.orderDate || o.createdAt),
        deliverDate: D(o.deliverDate),
        notes: S(o.notes),
      };

      const products = Array.isArray(o.products) ? o.products : [];
      if (products.length === 0) {
        rows.push({
          ...base,
          productIndex: "",
          productType: "",
          productDescription: "",
          ...extractGlazes({}),
        });
      } else {
        products.forEach((p, i) => {
          const glz = extractGlazes(p, {
            productType: p?.type,
            // To show "-" on non applicable fields
            notApplicablePlaceholder: "-", // or '' for empty
          });

          rows.push({
            ...base,
            productIndex: i + 1,
            productType: S(p?.type),
            productDescription: S(p?.description),
            ...glz,
          });
        });
      }
    }

    // ---------- dynamic columns (allows 'fields' selection) ----------
    const FIELD_DEFS = {
      orderID: { header: "orderID", key: "orderID", width: 20 },
      customerName: { header: "customerName", key: "customerName", width: 24 },
      customerPhone: {
        header: "customerPhone",
        key: "customerPhone",
        width: 16,
      },
      customerEmail: {
        header: "customerEmail",
        key: "customerEmail",
        width: 28,
      },
      status: { header: "status", key: "status", width: 14 },
      isUrgent: { header: "isUrgent", key: "isUrgent", width: 10 },
      orderDate: {
        header: "orderDate",
        key: "orderDate",
        width: 12,
        style: { numFmt: "yyyy-mm-dd" },
      },
      deliverDate: {
        header: "deliverDate",
        key: "deliverDate",
        width: 12,
        style: { numFmt: "yyyy-mm-dd" },
      },
      notes: { header: "notes", key: "notes", width: 40 },
      productIndex: { header: "productIndex", key: "productIndex", width: 10 },
      productType: { header: "productType", key: "productType", width: 16 },
      productDescription: {
        header: "productDescription",
        key: "productDescription",
        width: 40,
      },
      glazeInteriorName: {
        header: "glazeInteriorName",
        key: "glazeInteriorName",
        width: 18,
      },
      // glazeInteriorHex: {
      //   header: "glazeInteriorHex",
      //   key: "glazeInteriorHex",
      //   width: 14,
      // },
      glazeExteriorName: {
        header: "glazeExteriorName",
        key: "glazeExteriorName",
        width: 18,
      },
      // glazeExteriorHex: {
      //   header: "glazeExteriorHex",
      //   key: "glazeExteriorHex",
      //   width: 14,
      // },
    };

    // Default fields if none provided
    const DEFAULT_FIELDS = [
      "orderID",
      "customerName",
      "customerPhone",
      "customerEmail",
      "status",
      "isUrgent",
      "orderDate",
      "deliverDate",
      "notes",
      "productIndex",
      "productType",
      "productDescription",
      "glazeInteriorName",
      //"glazeInteriorHex",
      "glazeExteriorName",
      //"glazeExteriorHex",
    ];

    const chosen =
      Array.isArray(fields) && fields.length
        ? fields.filter((k) => FIELD_DEFS[k])
        : DEFAULT_FIELDS;

    // ---------- workbook ----------
    const wb = new ExcelJS.Workbook();
    wb.creator = "Haro-mobile";
    wb.created = new Date();

    const ws = wb.addWorksheet("Orders");
    ws.columns = chosen.map((k) => FIELD_DEFS[k]);

    // Simple header style (safe)
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 20;

    // A1:XX1 filter range based on column count
    ws.autoFilter = `A1:${colLetter(ws.columnCount)}1`;

    // Determine which column indexes are the glaze swatches (hex)
    const glazeNameCols = new Set(
      ["glazeInteriorName", "glazeExteriorName"]
        .filter((k) => chosen.includes(k))
        .map((k) => ws.getColumn(k).number)
    );

    // Add rows + styles
    for (const data of rows) {
      const r = ws.addRow(data);

      // Wrap long text
      if (FIELD_DEFS.notes && chosen.includes("notes")) {
        r.getCell("notes").alignment = { wrapText: true, vertical: "top" };
      }
      if (
        FIELD_DEFS.productDescription &&
        chosen.includes("productDescription")
      ) {
        r.getCell("productDescription").alignment = {
          wrapText: true,
          vertical: "top",
        };
      }

      // Apply glaze swatch fills (cell background = hex)
      if (chosen.includes("glazeInteriorName")) {
        const hex = data.glazeInteriorHex;
        const argb = toARGB(hex);
        if (argb) {
          const c = r.getCell("glazeInteriorName");
          c.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb },
          };
          // Determinar si el color de fondo es oscuro
          const textColor = isDarkColor(hex) ? "FFFFFFFF" : "FF000000"; // blanco o negro
          c.font = { color: { argb: textColor }, bold: true }; // opcional: bold
          c.alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true,
          };
        }
      }

      if (chosen.includes("glazeExteriorName")) {
        const hex = data.glazeExteriorHex;
        const argb = toARGB(hex);
        if (argb) {
          const c = r.getCell("glazeExteriorName");
          c.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb },
          };
          const textColor = isDarkColor(hex) ? "FFFFFFFF" : "FF000000";
          c.font = { color: { argb: textColor }, bold: true };
          c.alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true,
          };
        }
      }

      // Urgent row highlight: paint the whole row light red EXCEPT glaze swatches
      if (data.isUrgent) {
        for (let c = 1; c <= ws.columnCount; c++) {
          if (glazeNameCols.has(c)) continue; // do not override swatches
          r.getCell(c).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF0000" },
          };
        }
      }
    }

    // Auto-fit columns (safe heuristic)
    autoFitColumns(ws, { min: 10, max: 70, padding: 2 });
    if (chosen.includes("notes")) {
      ws.getColumn("notes").width = Math.max(
        ws.getColumn("notes").width ?? 40,
        50
      );
    }
    if (chosen.includes("productDescription")) {
      ws.getColumn("productDescription").width = Math.max(
        ws.getColumn("productDescription").width ?? 40,
        50
      );
    }

    // ---- send as buffer (avoids streaming/compression issues) ----
    const pad = (n) => String(n).padStart(2, "0");
    const now = new Date();
    const fecha = `${pad(now.getDate())}-${pad(
      now.getMonth() + 1
    )}-${now.getFullYear()}`;
    const filename = `pedidos-${fecha}.xlsx`;

    const buf = await wb.xlsx.writeBuffer();
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
        filename
      )}`
    );
    res.setHeader("Content-Length", buf.byteLength);
    return res.end(Buffer.from(buf));
  } catch (err) {
    console.error("Error exporting Excel:", err);
    return res.status(500).json({ error: "Failed to export Excel" });
  }
};

// Excel column number → letter, e.g., 1 -> A, 28 -> AB
function colLetter(n) {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = ((n - 1) / 26) | 0;
  }
  return s;
}

/** Auto-fit helper: compute column width from longest cell text (very safe) */
function autoFitColumns(ws, opts = {}) {
  const min = opts.min ?? 8;
  const max = opts.max ?? 60;
  const padding = opts.padding ?? 1;

  ws.columns.forEach((col) => {
    let maxLen = 0;
    col.eachCell({ includeEmpty: true }, (cell) => {
      let v = cell.value;
      if (v == null) v = "";
      else if (v.richText) v = v.richText.map((r) => r.text).join("");
      else if (typeof v === "object" && v.text) v = v.text;
      else if (v instanceof Date) v = "yyyy-mm-dd";
      else v = String(v);
      if (v.length > maxLen) maxLen = v.length;
    });
    col.width = Math.min(max, Math.max(min, maxLen + padding));
  });
}
// end exportOrdersToExcel
