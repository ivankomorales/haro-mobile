// controllers/exportController.js
const PDFDocument = require("pdfkit");
const Order = require("../models/Order");
const axios = require("axios");
const stream = require("stream");
const sizeOf = require("image-size");
const { promisify } = require("util");
const finished = promisify(stream.finished);

exports.exportOrdersToPDF = async (req, res) => {
  try {
    const filters = req.body || {};
    const orders = await Order.find(filters);

    if (!orders.length) {
      return res.status(404).json({ error: "No orders found" });
    }

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="orders.pdf"');
    doc.pipe(res);

    const margin = 30;
    const spacing = 10;
    const imgWidth = (doc.page.width - margin * 2 - spacing) / 2;
    const imgHeight = imgWidth;

    for (let order of orders) {
      doc.addPage();

      // Header de orden
      doc
        .fontSize(16)
        .text(`Order #${order.orderID}`, { align: "center" })
        .moveDown(0.5);

      doc
        .fontSize(12)
        .text(
          `${order.customer?.name || ""} ${order.customer?.lastName || ""}`,
          { align: "center" }
        )
        .moveDown(0.5);

      if (order.notes) {
        doc.fontSize(11).text(order.notes, {
          align: "center",
          width: 440,
        });
      }

      doc.moveDown(1);

      const allImages = order.products.flatMap((p) => p.images || []);

      let y = doc.y;

      for (let i = 0; i < allImages.length; i++) {
        if (i > 0 && i % 4 === 0) {
          doc.addPage();
          y = margin;
        }

        const col = i % 2;
        const row = Math.floor((i % 4) / 2);
        const x = margin + col * (imgWidth + spacing);
        const yPos = y + row * (imgHeight + spacing);

        const imageUrl = allImages[i];
        try {
          const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
          });
          const buffer = Buffer.from(response.data, "binary");
          doc.image(buffer, x, yPos, {
            width: imgWidth,
            height: imgHeight,
          });
        } catch (imgErr) {
          console.warn(`❌ Failed to load image: ${imageUrl}`);
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
