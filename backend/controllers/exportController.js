// src/controllers/exportController.js
const PDFDocument = require("pdfkit");
const Order = require("../models/Order");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const stream = require("stream");
const { promisify } = require("util");
const finished = promisify(stream.finished);

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
};
