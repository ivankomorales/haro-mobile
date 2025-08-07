const PDFDocument = require("pdfkit");
const Order = require("../models/Order");
const axios = require("axios");
const stream = require("stream");
const { promisify } = require("util");
const finished = promisify(stream.finished);

exports.exportOrdersToPDF = async (req, res) => {
  const productLabels = {
    figure: "Figura",
    cup: "Taza",
    handmadeCup: "Taza a Mano",
    plate: "Platito",
    figurine: "Escultura",
  };

  try {
    const { orderIds } = req.body;
    const orders = await Order.find({ _id: { $in: orderIds } }).populate(
      "customer"
    );

    if (!orders.length) {
      return res.status(404).json({ error: "No orders found" });
    }

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="orders.pdf"');
    doc.pipe(res);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 30;
    const spacing = 10;
    const maxWidth = (pageWidth - margin * 2 - spacing) / 2;
    const maxHeight = maxWidth;

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];

      if (i > 0) doc.addPage();

      // 🧾 Header
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text(`Order #${order.orderID}`, { align: "left" });
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(
          `${order.customer?.name || ""} ${order.customer?.lastName || ""}`,
          { align: "left" }
        );

      if (order.notes) {
        doc.moveDown(0.2);
        doc.font("Helvetica").fontSize(12).text(order.notes, {
          align: "left",
          width: 440,
        });
      }

      doc.moveDown(1);

      // 🧾 Lista de productos
      for (let j = 0; j < order.products.length; j++) {
        const product = order.products[j];
        const typeLabel =
          productLabels[product.type] || capitalize(product.type);

        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .text(`${typeLabel} ${j + 1}:`, { continued: true })
          .font("Helvetica")
          .text(` ${product.description || "(No description)"}`);

        doc.moveDown(0.5);

        const images = product.images || [];
        let y = doc.y;

        if (y + maxHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        for (let k = 0; k < images.length; k++) {
          // Saltar de fila si ya se llenaron las dos columnas
          if (k > 0 && k % 2 === 0) {
            y += maxHeight + spacing;

            // Verifica si necesitas nueva página
            if (y + maxHeight > pageHeight - margin) {
              doc.addPage();
              y = margin;
            }
          }

          const col = k % 2;
          const x = margin + col * (maxWidth + spacing);

          try {
            const response = await axios.get(images[k], {
              responseType: "arraybuffer",
            });
            const buffer = Buffer.from(response.data, "binary");

            doc.image(buffer, x, y, {
              fit: [maxWidth, maxHeight],
              align: "center",
              valign: "center",
            });
          } catch (imgErr) {
            console.warn(`❌ Failed to load image: ${images[k]}`);
          }
        }

        // Avanza debajo del último bloque de imágenes del producto
        y += maxHeight + spacing;
        if (y > doc.y) doc.y = y;

        doc.moveDown(1);
      }
    }

    doc.end();
    await finished(res);
  } catch (err) {
    console.error("Error exporting PDF:", err);
    res.status(500).json({ error: "Failed to export PDF" });
  }
};

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
