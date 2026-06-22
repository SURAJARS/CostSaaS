const ExcelJS = require('exceljs');
const path = require('path');

const generateExcelReport = async (estimation, companyName = 'Your Catering Business') => {
  const workbook = new ExcelJS.Workbook();

  try {
    // Sheet 1: Summary
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Field', key: 'field', width: 25 },
      { header: 'Value', key: 'value', width: 35 }
    ];

    summarySheet.addRows([
      { field: 'Company Name', value: companyName },
      { field: 'Customer Name', value: estimation.customerName || 'N/A' },
      { field: 'Mobile Number', value: estimation.mobileNumber || 'N/A' },
      { field: 'Event Date', value: estimation.eventDate ? new Date(estimation.eventDate).toLocaleDateString() : 'N/A' },
      { field: 'Guest Count', value: estimation.guestCount || 0 },
      { field: 'Raw Material Cost', value: estimation.rawMaterialCost || 0 },
      { field: 'Labour Cost', value: estimation.additionalCost?.labourCost || 0 },
      { field: 'Gas Cost', value: estimation.additionalCost?.gasCost || 0 },
      { field: 'Transport Cost', value: estimation.additionalCost?.transportCost || 0 },
      { field: 'Miscellaneous Cost', value: estimation.additionalCost?.miscellaneousCost || 0 },
      { field: 'Profit Margin %', value: estimation.profitMargin || 0 },
      { field: 'Profit Amount', value: estimation.profitAmount || 0 },
      { field: 'Grand Total', value: estimation.grandTotal || 0 }
    ]);

    // Sheet 2: Menu Wise Calculation
    const menuSheet = workbook.addWorksheet('Menu Wise Calculation');
    menuSheet.columns = [
      { header: 'Menu Name (EN)', key: 'menuName_en', width: 25 },
      { header: 'Menu Name (TA)', key: 'menuName_ta', width: 25 },
      { header: 'Quantity', key: 'quantity', width: 10 }
    ];

    if (estimation.selectedMenus && estimation.selectedMenus.length > 0) {
      estimation.selectedMenus.forEach(menu => {
        menuSheet.addRow({
          menuName_en: menu.menuName_en || 'N/A',
          menuName_ta: menu.menuName_ta || 'N/A',
          quantity: menu.quantity || 1
        });
      });
    }

    // Sheet 3: Ingredient Consolidation
    const ingredientSheet = workbook.addWorksheet('Ingredient Consolidation');
    ingredientSheet.columns = [
      { header: 'Ingredient (EN)', key: 'ingredientName_en', width: 25 },
      { header: 'Ingredient (TA)', key: 'ingredientName_ta', width: 25 },
      { header: 'Unit', key: 'unit', width: 10 },
      { header: 'Required Qty', key: 'requiredQty', width: 15 },
      { header: 'Rate', key: 'currentRate', width: 15 },
      { header: 'Amount', key: 'amount', width: 15 }
    ];

    if (estimation.ingredients && estimation.ingredients.length > 0) {
      estimation.ingredients.forEach(ingredient => {
        ingredientSheet.addRow({
          ingredientName_en: ingredient.ingredientName_en || 'N/A',
          ingredientName_ta: ingredient.ingredientName_ta || 'N/A',
          unit: ingredient.unit || 'N/A',
          requiredQty: ingredient.requiredQty || 0,
          currentRate: ingredient.currentRate || 0,
          amount: ingredient.amount || 0
        });
      });
    }

    return workbook;
  } catch (error) {
    console.error('Error generating Excel report:', error);
    throw error;
  }
};

module.exports = {
  generateExcelReport
};
