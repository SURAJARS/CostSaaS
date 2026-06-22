const ExcelJS = require('exceljs');
const path = require('path');

const generateExcelReport = async (estimation, companyName = 'Your Catering Business') => {
  const workbook = new ExcelJS.Workbook();

  // Sheet 1: Summary
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Field', key: 'field', width: 25 },
    { header: 'Value', key: 'value', width: 35 }
  ];

  summarySheet.addRows([
    { field: 'Company Name', value: companyName },
    { field: 'Customer Name', value: estimation.customerName },
    { field: 'Mobile Number', value: estimation.mobileNumber },
    { field: 'Event Date', value: estimation.eventDate?.toLocaleDateString() },
    { field: 'Guest Count', value: estimation.guestCount },
    { field: 'Raw Material Cost', value: estimation.rawMaterialCost },
    { field: 'Labour Cost', value: estimation.additionalCost?.labourCost },
    { field: 'Gas Cost', value: estimation.additionalCost?.gasCost },
    { field: 'Transport Cost', value: estimation.additionalCost?.transportCost },
    { field: 'Miscellaneous Cost', value: estimation.additionalCost?.miscellaneousCost },
    { field: 'Profit Margin %', value: estimation.profitMargin },
    { field: 'Profit Amount', value: estimation.profitAmount },
    { field: 'Grand Total', value: estimation.grandTotal }
  ]);

  // Sheet 2: Menu Wise Calculation
  const menuSheet = workbook.addWorksheet('Menu Wise Calculation');
  menuSheet.columns = [
    { header: 'Menu Name (EN)', key: 'menuName_en', width: 25 },
    { header: 'Menu Name (TA)', key: 'menuName_ta', width: 25 }
  ];

  estimation.selectedMenus?.forEach(menu => {
    menuSheet.addRow({
      menuName_en: menu.menuName_en,
      menuName_ta: menu.menuName_ta
    });
  });

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

  estimation.ingredients?.forEach(ingredient => {
    ingredientSheet.addRow({
      ingredientName_en: ingredient.ingredientName_en,
      ingredientName_ta: ingredient.ingredientName_ta,
      unit: ingredient.unit,
      requiredQty: ingredient.requiredQty,
      currentRate: ingredient.currentRate,
      amount: ingredient.amount
    });
  });

  return workbook;
};

module.exports = {
  generateExcelReport
};
