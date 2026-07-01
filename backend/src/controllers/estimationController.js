const estimationService = require('../services/estimationService');
const { generateExcelReport } = require('../exports/excelExport');
const { generatePdfReport } = require('../exports/pdfExport');
const { validateEstimation } = require('../validators');

class EstimationController {
  async createEstimation(req, res, next) {
    try {
      const { error, value } = validateEstimation(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
      }

      const estimation = await estimationService.createEstimation(value, req.user._id);
      res.status(201).json({ success: true, message: 'Estimation created successfully', data: estimation });
    } catch (error) {
      next(error);
    }
  }

  async getEstimations(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const filter = {};

      if (req.query.status) filter.status = req.query.status;
      if (req.user.role === 'staff') filter.createdBy = req.user._id;

      const { estimations, total } = await estimationService.getEstimations(filter, skip, limit);
      res.status(200).json({
        success: true,
        data: estimations,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      next(error);
    }
  }

  async getEstimationById(req, res, next) {
    try {
      const estimation = await estimationService.getEstimationById(req.params.id);
      if (!estimation) {
        return res.status(404).json({ success: false, message: 'Estimation not found' });
      }
      res.status(200).json({ success: true, data: estimation });
    } catch (error) {
      next(error);
    }
  }

  async updateEstimation(req, res, next) {
    try {
      const estimation = await estimationService.getEstimationById(req.params.id);
      if (!estimation) {
        return res.status(404).json({ success: false, message: 'Estimation not found' });
      }

      // Check if estimation is locked (Approved or Completed)
      const isLocked = estimation.status === 'Approved' || estimation.status === 'Completed';
      const isOnlyStatusChange = Object.keys(req.body).length === 1 && req.body.status;

      if (isLocked && !isOnlyStatusChange) {
        return res.status(403).json({ 
          success: false, 
          message: `Cannot edit estimation with status "${estimation.status}". Only status changes are allowed.` 
        });
      }

      const updateData = req.body;
      const updatedEstimation = await estimationService.updateEstimation(req.params.id, {
        ...updateData,
        updatedAt: new Date()
      });
      if (!updatedEstimation) {
        return res.status(404).json({ success: false, message: 'Estimation not found' });
      }
      res.status(200).json({ success: true, message: 'Estimation updated successfully', data: updatedEstimation });
    } catch (error) {
      next(error);
    }
  }

  async deleteEstimation(req, res, next) {
    try {
      const estimation = await estimationService.deleteEstimation(req.params.id);
      if (!estimation) {
        return res.status(404).json({ success: false, message: 'Estimation not found' });
      }
      res.status(200).json({ success: true, message: 'Estimation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async exportToExcel(req, res, next) {
    try {
      const estimation = await estimationService.getEstimationById(req.params.id);
      if (!estimation) {
        return res.status(404).json({ success: false, message: 'Estimation not found' });
      }
      const ingredientsByMenu =
        await estimationService.buildIngredientsByMenu(
          estimation.selectedMenus,
          estimation.guestCount
        );

      try {
        const workbook = await generateExcelReport(estimation,ingredientsByMenu, process.env.COMPANY_NAME);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="estimation_${estimation._id}.xlsx"`);
        
        await workbook.xlsx.write(res);
        res.end();
      } catch (excelError) {
        console.error('Excel generation error:', excelError);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Failed to generate Excel file' });
        } else {
          res.end();
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error exporting to Excel' });
      }
    }
  }

  async exportToPdf(req, res, next) {
    try {
      const estimation = await estimationService.getEstimationById(req.params.id);
      if (!estimation) {
        return res.status(404).json({ success: false, message: 'Estimation not found' });
      }
      const ingredientsByMenu =
    await estimationService.buildIngredientsByMenu(
        estimation.selectedMenus,
        estimation.guestCount
    );

const reportData = {
    estimation,
    ingredientsByMenu,
    companyName: process.env.COMPANY_NAME
};

const filename = await generatePdfReport(reportData);

      res.download(`uploads/${filename}`, `estimation_${estimation._id}.pdf`);
    } catch (error) {
      next(error);
    }
  }

  async exportBulkToExcel(req, res, next) {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'No estimation IDs provided' });
      }

      // Fetch all estimations
      const estimations = await estimationService.getEstimationsByIds(ids);
      if (estimations.length === 0) {
        return res.status(404).json({ success: false, message: 'No estimations found' });
      }

      try {
        // Create a workbook with multiple sheets (one per estimation)
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();

        for (const estimation of estimations) {
          // Create a unique worksheet name
let baseSheetName = (estimation.chefName || "Estimation").substring(0, 31);
let sheetName = baseSheetName;
let counter = 1;

// Ensure worksheet name is unique
while (workbook.getWorksheet(sheetName)) {
  const suffix = ` (${counter++})`;

  // Excel sheet names max 31 chars
  sheetName =
    baseSheetName.substring(0, 31 - suffix.length) + suffix;
}

const worksheet = workbook.addWorksheet(sheetName); 
          
          // Add header
          worksheet.columns = [
            { header: 'Chef Name', key: 'chefName', width: 20 },
            { header: 'Event Date', key: 'eventDate', width: 15 },
            { header: 'Event Venue', key: 'eventVenue', width: 20 },
            { header: 'Guest Count', key: 'guestCount', width: 12 },
            { header: 'Raw Material Cost', key: 'rawMaterialCost', width: 18 },
            { header: 'Labour Cost', key: 'labourCost', width: 15 },
            { header: 'Gas Cost', key: 'gasCost', width: 12 },
            { header: 'Transport Cost', key: 'transportCost', width: 15 },
            { header: 'Miscellaneous Cost', key: 'miscellaneousCost', width: 18 },
            { header: 'Profit Margin (%)', key: 'profitMargin', width: 15 },
            { header: 'Profit Amount', key: 'profitAmount', width: 15 },
            { header: 'Grand Total', key: 'grandTotal', width: 15 }
          ];

          // Add data row
          worksheet.addRow({
            chefName: estimation.chefName,
            eventDate: new Date(estimation.eventDate).toLocaleDateString('en-IN'),
            eventVenue: estimation.eventVenue,
            guestCount: estimation.guestCount,
            rawMaterialCost: estimation.rawMaterialCost || 0,
            labourCost: estimation.additionalCost?.labourCost || 0,
            gasCost: estimation.additionalCost?.gasCost || 0,
            transportCost: estimation.additionalCost?.transportCost || 0,
            miscellaneousCost: estimation.additionalCost?.miscellaneousCost || 0,
            profitMargin: estimation.profitMargin || 0,
            profitAmount: estimation.profitAmount || 0,
            grandTotal: estimation.grandTotal || 0
          });

          // Style header
          worksheet.getRow(1).font = { bold: true };
          worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="estimations_bulk_${new Date().getTime()}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();
      } catch (excelError) {
        console.error('Excel generation error:', excelError);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Failed to generate Excel file' });
        } else {
          res.end();
        }
      }
    } catch (error) {
      console.error('Bulk export error:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error exporting to Excel' });
      }
    }
  }

  async getReportsByDateRange(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Start date and end date are required' });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const { estimations, total } = await estimationService.getEstimationsByDateRange(startDate, endDate, skip, limit);
      res.status(200).json({
        success: true,
        data: estimations,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      next(error);
    }
  }

  async getReportsByCustomer(req, res, next) {
    try {
      const { customerName } = req.query;
      if (!customerName) {
        return res.status(400).json({ success: false, message: 'Customer name is required' });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const { estimations, total } = await estimationService.getEstimationsByCustomer(customerName, skip, limit);
      res.status(200).json({
        success: true,
        data: estimations,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const analytics = await estimationService.getAnalytics(req.user._id, req.user.role);
      res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EstimationController();
