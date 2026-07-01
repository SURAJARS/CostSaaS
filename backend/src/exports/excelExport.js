const ExcelJS = require('exceljs');
const path = require('path');

const generateExcelReport = async (estimation,ingredientsByMenu, companyName = 'Your Catering Business') => {
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

    // ======================================
    // Sheet 4: Ingredient Consolidation by Menu
    // ======================================

    const ingredientByMenuSheet = workbook.addWorksheet(
      'Ingredient Consolidation by Menu'
    );

    ingredientByMenuSheet.columns = [
      { header: 'Ingredient (EN)', key: 'ingredient_en', width: 35 },
      { header: 'Ingredient (TA)', key: 'ingredient_ta', width: 35 },
      { header: 'Required Qty', key: 'requiredQty', width: 18 }
    ];
    ingredientByMenuSheet.spliceRows(1, 1);

    if (ingredientsByMenu && ingredientsByMenu.length > 0) {

      ingredientsByMenu.forEach(menu => {

        // Menu Heading
        const headingRow = ingredientByMenuSheet.addRow([
          `MENU : ${menu.menuName_en || 'Unnamed Menu'}`
        ]);

        headingRow.font = {
          bold: true,
          size: 14
        };

        // Empty row
        ingredientByMenuSheet.addRow([]);

        // Table Header
        const headerRow = ingredientByMenuSheet.addRow([
          'Ingredient (EN)',
          'Ingredient (TA)',
          'Required Qty'
        ]);

        headerRow.font = {
          bold: true
        };

        headerRow.eachCell(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D9D9D9' }
          };

          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };

          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        });

        // Ingredients
        (menu.ingredients || []).forEach(ingredient => {

          const row = ingredientByMenuSheet.addRow([
            ingredient.ingredientName_en || 'N/A',
            ingredient.ingredientName_ta || 'N/A',
            `${ingredient.requiredQty || 0} ${ingredient.unit || ''}`         
           ]);

          row.eachCell(cell => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });

        });

        // Space before next menu
        ingredientByMenuSheet.addRow([]);
        ingredientByMenuSheet.addRow([]);

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
