const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generatePdfReport = (estimation, companyName = 'Your Catering Business') => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const filename = `estimation_${estimation._id}.pdf`;
      const filepath = path.join(__dirname, '../../uploads', filename);

      // Ensure uploads directory exists
      if (!fs.existsSync(path.dirname(filepath))) {
        fs.mkdirSync(path.dirname(filepath), { recursive: true });
      }

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text(companyName, { align: 'center' });
      doc.fontSize(12).text('Catering Cost Estimation', { align: 'center' });
      doc.moveDown(0.5);

      // Customer Details
      doc.fontSize(11).font('Helvetica-Bold').text('Customer Details:', { underline: true });
      doc.fontSize(10).font('Helvetica');
      doc.text(`Name: ${estimation.customerName}`);
      doc.text(`Mobile: ${estimation.mobileNumber}`);
      doc.text(`Event Date: ${estimation.eventDate?.toLocaleDateString()}`);
      doc.text(`Guest Count: ${estimation.guestCount}`);
      doc.moveDown(0.5);

      // Selected Menus
      doc.fontSize(11).font('Helvetica-Bold').text('Selected Menus:', { underline: true });
      estimation.selectedMenus?.forEach(menu => {
        doc.fontSize(10).font('Helvetica').text(`• ${menu.menuName_en} (${menu.menuName_ta})`);
      });
      doc.moveDown(0.5);

      // Ingredient Table
      doc.fontSize(11).font('Helvetica-Bold').text('Ingredient Requirements:', { underline: true });
      doc.moveDown(0.25);

      const tableTop = doc.y;
      const colWidths = [120, 80, 80, 90];
      const columns = ['Ingredient', 'Unit', 'Qty', 'Amount'];

      // Table header
      doc.fontSize(9).font('Helvetica-Bold');
      let xPos = 50;
      columns.forEach((col, i) => {
        doc.text(col, xPos, tableTop);
        xPos += colWidths[i];
      });

      // Table rows
      doc.font('Helvetica').fontSize(9);
      let y = tableTop + 20;
      estimation.ingredients?.forEach(ingredient => {
        xPos = 50;
        doc.text(ingredient.ingredientName_en?.substring(0, 15), xPos, y);
        xPos += colWidths[0];
        doc.text(ingredient.unit, xPos, y);
        xPos += colWidths[1];
        doc.text(ingredient.requiredQty.toFixed(2), xPos, y);
        xPos += colWidths[2];
        doc.text(ingredient.amount.toFixed(2), xPos, y);
        y += 15;
      });

      doc.moveDown(2);

      // Cost Breakdown
      doc.fontSize(11).font('Helvetica-Bold').text('Cost Breakdown:', { underline: true });
      doc.fontSize(10).font('Helvetica');
      doc.text(`Raw Material Cost: ₹ ${estimation.rawMaterialCost?.toFixed(2)}`);
      doc.text(`Labour Cost: ₹ ${estimation.additionalCost?.labourCost?.toFixed(2)}`);
      doc.text(`Gas Cost: ₹ ${estimation.additionalCost?.gasCost?.toFixed(2)}`);
      doc.text(`Transport Cost: ₹ ${estimation.additionalCost?.transportCost?.toFixed(2)}`);
      doc.text(`Miscellaneous Cost: ₹ ${estimation.additionalCost?.miscellaneousCost?.toFixed(2)}`);
      doc.moveDown(0.25);
      doc.font('Helvetica-Bold');
      doc.text(`Profit Margin: ${estimation.profitMargin}%`);
      doc.text(`Profit Amount: ₹ ${estimation.profitAmount?.toFixed(2)}`);
      doc.moveDown(0.25);
      doc.fontSize(12);
      doc.text(`Grand Total: ₹ ${estimation.grandTotal?.toFixed(2)}`, { underline: true });

      doc.end();

      stream.on('finish', () => {
        resolve(filename);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generatePdfReport
};
