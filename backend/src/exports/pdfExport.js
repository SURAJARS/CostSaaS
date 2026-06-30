const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// ======================================
// Format Quantity for Display
// ======================================
const formatQuantity = (quantity, unit) => {
  if (quantity == null) {
    return {
      quantity: 0,
      unit: unit || ''
    };
  }

  const qty = Number(quantity);

  if (unit === 'gm' && qty >= 1000) {
    return {
      quantity: Number((qty / 1000).toFixed(2)).toString().replace(/\.00$/, ''),
      unit: 'kg'
    };
  }

  if (unit === 'ml' && qty >= 1000) {
    return {
      quantity: Number((qty / 1000).toFixed(2)).toString().replace(/\.00$/, ''),
      unit: 'L'
    };
  }

  return {
    quantity: Number(qty.toFixed(2)).toString().replace(/\.00$/, ''),
    unit
  };
};

const generatePdfReport = (estimation, companyName = 'Your Catering Business') => {
  return new Promise((resolve, reject) => {
    try {
      // ======================================
      // Draw Ingredient Table Header
      // ======================================
      const drawTableHeader = (doc, startX, tableY, colWidths) => {

        // Header Background
        doc
          .save()
          .fillColor('#F2F2F2')
          .rect(startX, tableY, 450, 22)
          .fill()
          .restore();

        // Header Border
        doc
          .strokeColor('#CCCCCC')
          .rect(startX, tableY, 450, 22)
          .stroke();

        doc
          .fillColor('#000000')
          .font('Helvetica-Bold')
          .fontSize(10);

        doc.text('Ingredient', startX + 5, tableY + 6, {
          width: colWidths[0]
        });

        doc.text('Qty', startX + colWidths[0] + 5, tableY + 6, {
          width: colWidths[1],
          align: 'right'
        });

        doc.text(
          'Unit',
          startX + colWidths[0] + colWidths[1] + 5,
          tableY + 6,
          {
            width: colWidths[2],
            align: 'center'
          }
        );

        doc.text(
          'Amount (Rs.)',
          startX + colWidths[0] + colWidths[1] + colWidths[2] + 5,
          tableY + 6,
          {
            width: colWidths[3],
            align: 'right'
          }
        );

      };
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const filename = `estimation_${estimation._id}.pdf`;
      const filepath = path.join(__dirname, '../../uploads', filename);

      // Ensure uploads directory exists
      if (!fs.existsSync(path.dirname(filepath))) {
        fs.mkdirSync(path.dirname(filepath), { recursive: true });
      }

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // ===============================
      // Header
      // ===============================
      doc
        .font('Helvetica-Bold')
      .fontSize(24)
      .fillColor('#000000')
      .text('KASIKANNU CATERING WORLD', {
        align: 'center'
      });

      doc
        .moveDown(0.2)
        .font('Helvetica')
        .fontSize(14)
        .fillColor('#666666')
        .text('Premium Wedding Caterer', {
          align: 'center'
        });

      doc.moveDown(0.4);

      doc
        .strokeColor('#999999')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();

      doc.moveDown(0.6);

      doc
        .font('Helvetica-Bold')
        .fontSize(18)
        .fillColor('#000000')
        .text('Catering Cost Estimation', {
          align: 'center'
        });

      doc.moveDown(0.8);

      // Customer Details
      // ===============================
      // Event Details
      // ===============================
      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor('#000000')
        .text('Event Details');

      doc.moveDown(0.3);

      doc.font('Helvetica').fontSize(11);

      doc.text(`Chef Name   : ${estimation.chefName || 'N/A'}`);
      doc.text(`Event Venue : ${estimation.eventVenue || 'N/A'}`);
      doc.text(
        `Event Date  : ${
          estimation.eventDate
            ? new Date(estimation.eventDate).toLocaleDateString()
            : 'N/A'
        }`
      );
      doc.text(`Guest Count : ${estimation.guestCount || 0}`);

      doc.moveDown(0.6);

      doc
        .strokeColor('#DDDDDD')
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();

      doc.moveDown(0.6);

      // Selected Menus
      doc.fontSize(11).font('Helvetica-Bold').text('Selected Menus:');
      if (estimation.selectedMenus && estimation.selectedMenus.length > 0) {
        estimation.selectedMenus.forEach(menu => {
          doc.fontSize(10).font('Helvetica').text(`• ${menu.menuName_en || 'Unknown'}`);
        });
      }
      doc.moveDown(0.5);

      // Ingredient Table
      // ===============================
      // Ingredient Requirements
      // ===============================
      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor('#000000')
        .text('Ingredient Requirements');

      doc.moveDown(0.4);

      const tableTop = doc.y;
      const startX = 50;

      const colWidths = [180, 80, 80, 110];

      drawTableHeader(doc, startX, tableTop, colWidths);

      // Table Rows
      let y = tableTop + 22;

      doc.font('Helvetica').fontSize(9);

      if (estimation.ingredients && estimation.ingredients.length > 0) {

        estimation.ingredients.forEach((ingredient, index) => {
          // ======================================
          // Automatic Page Break
          // ======================================
          if (y > 720) {

            doc.addPage();

            y = 50;

            drawTableHeader(doc, startX, y, colWidths);

            y += 22;
          }

          // Alternate row background
          if (index % 2 === 0) {
            doc
              .rect(startX, y, 450, 20)
              .fill('#FAFAFA');
          }

          doc.fillColor('#000000');

          const formattedQty = formatQuantity(
          ingredient.requiredQty || 0,
          ingredient.unit || ''
        );

        // Calculate dynamic row height based on ingredient name
        const ingredientName = ingredient.ingredientName_en || 'Unknown';

        const textHeight = doc.heightOfString(
          ingredientName,
          {
            width: colWidths[0] - 10
          }
        );

        // Minimum row height = 20
        const rowHeight = Math.max(20, textHeight + 10);


          doc.text(
            ingredientName,
            startX + 5,
            y + 5,
            {
              width: colWidths[0] - 10
            }
          );

          
        doc.text(
          formattedQty.quantity.toString(),
          startX + colWidths[0] + 5,
          y + 5,
          {
            width: colWidths[1] - 10,
            align: 'right'
          }
        );

        doc.text(
          formattedQty.unit,
          startX + colWidths[0] + colWidths[1] + 5,
          y + 5,
          {
            width: colWidths[2] - 10,
            align: 'center'
          }
        );

          doc.text(
            (ingredient.amount || 0).toFixed(2),
            startX + colWidths[0] + colWidths[1] + colWidths[2] + 5,
            y + 5,
            {
              width: colWidths[3] - 10,
              align: 'right'
            }
          );

          // Row Border
          doc
            .strokeColor('#DDDDDD')
            .lineWidth(0.5)
            .moveTo(startX, y + rowHeight)
            .lineTo(startX + 450, y + rowHeight)
            .stroke();

          // Move to next row
          y += rowHeight;
        });

      }

      doc.moveDown(2);

      // ======================================
      // Ensure enough space for Cost Breakdown
      // ======================================
      if (doc.y > 520) {
          doc.addPage();
          doc.y = 50;
      }

    
      // Cost Breakdown
      // ===============================

      doc.moveDown(0.5);

      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor('#000000')
        .text('Cost Breakdown');

      doc.moveDown(0.4);

      const labelX = 60;
      const amountX = 380;

      const addCostRow = (label, value, bold = false) => {
        doc
          .font(bold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(10)
          .fillColor('#000000');

        doc.text(label, labelX, doc.y, {
          continued: false
        });

        doc.text(
          `Rs. ${Number(value || 0).toFixed(2)}`,
          amountX,
          doc.y - 12,
          {
            width: 120,
            align: 'right'
          }
        );

        doc.moveDown(0.4);
      };

      addCostRow('Raw Material Cost', estimation.rawMaterialCost);
      addCostRow('Labour Cost', estimation.additionalCost?.labourCost);
      addCostRow('Gas Cost', estimation.additionalCost?.gasCost);
      addCostRow('Transport Cost', estimation.additionalCost?.transportCost);
      addCostRow('Miscellaneous Cost', estimation.additionalCost?.miscellaneousCost);

      doc.moveDown(0.2);

      doc
        .strokeColor('#999999')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();

      doc.moveDown(0.5);

      doc.font('Helvetica-Bold');

      doc.text(`Profit Margin`, labelX, doc.y);

      doc.text(
        `${estimation.profitMargin || 0}%`,
        amountX,
        doc.y - 12,
        {
          width: 120,
          align: 'right'
        }
      );

      doc.moveDown(0.4);

      doc.text(`Profit Amount`, labelX, doc.y);

      doc.text(
        `Rs. ${(estimation.profitAmount || 0).toFixed(2)}`,
        amountX,
        doc.y - 12,
        {
          width: 120,
          align: 'right'
        }
      );

      doc.moveDown(0.5);

      // ===============================
      // Grand Total Box
      // ===============================
      const grandTotalY = doc.y;

      doc
        .rect(50, grandTotalY, 495, 35)
        .fillAndStroke('#EFEFEF', '#AAAAAA');

      doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(14);

      doc.text(
        'GRAND TOTAL',
        60,
        grandTotalY + 10
      );

      doc.text(
        `Rs. ${(estimation.grandTotal || 0).toFixed(2)}`,
        350,
        grandTotalY + 10,
        {
          width: 180,
          align: 'right'
        }
      );

      // Move cursor below the box
      doc.y = grandTotalY + 45;
            

      // Footer
      doc
        .strokeColor('#CCCCCC')
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();

      doc.moveDown(0.7);

      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#000000')
        .text('Thank you for choosing', {
          align: 'center'
        });

      doc
        .fontSize(13)
        .text('Kasikannu Catering World', {
          align: 'center'
        });

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#666666')
        .text('Premium Wedding Caterer', {
          align: 'center'
        });

      doc.end();

      stream.on('finish', () => {
        resolve(filename);
      });

      stream.on('error', (err) => {
        reject(err);
      });

      doc.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      console.error('Error generating PDF report:', error);
      reject(error);
    }
  });
};

module.exports = {
  generatePdfReport
};
