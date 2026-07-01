const Estimation = require('../models/Estimation');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const Menu = require('../models/Menu');
const {
  consolidateIngredients,
  calculateRequiredQty,
  calculateIngredientCost,
  calculateRawMaterialCost,
  consolidateExpenses,
  calculateExpenseCost,
  calculateGrandTotal
} = require('../utils/calculation');

class EstimationService {
  // ======================================
// Build Ingredients By Menu
// ======================================
async buildIngredientsByMenu(selectedMenus, guestCount) {

  const menuIds = selectedMenus.map(menu =>
    menu.menuId._id ? menu.menuId._id : menu.menuId
  );

  const recipes = await Recipe.find({
    menuId: { $in: menuIds },
    status: 'active'
  }).populate('ingredients.ingredientId');

  const menuDetails = await Menu.find({
    _id: { $in: menuIds }
  });

  const menuMap = {};

  menuDetails.forEach(menu => {

    menuMap[menu._id.toString()] = {

      name_en: menu.name_en,
      name_ta: menu.name_ta

    };
     });
     const ingredientsByMenu = [];
     for (const recipe of recipes) {

  const menuId = recipe.menuId._id
    ? recipe.menuId._id.toString()
    : recipe.menuId.toString();

  const menuData = {

    menuId,

    menuName_en: menuMap[menuId]?.name_en || 'Unknown',

    menuName_ta: menuMap[menuId]?.name_ta || 'Unknown',

    ingredients: []

  };
  recipe.ingredients.forEach(ingredient => {
    if (!ingredient.ingredientId) {
    return;
  }

  menuData.ingredients.push({

    ingredientId: ingredient.ingredientId?._id || ingredient.ingredientId,

    ingredientName_en:
  ingredient.ingredientName_en ||
  ingredient.ingredientId?.name_en ||
  'Unknown',

ingredientName_ta:
  ingredient.ingredientName_ta ||
  ingredient.ingredientId?.name_ta ||
  'Unknown',

    unit: ingredient.unit,

    requiredQty: calculateRequiredQty(
      ingredient.quantity,
      guestCount,
      recipe.baseMembers
    )

  });

}
);
ingredientsByMenu.push(menuData);

}
return ingredientsByMenu;
}
  
  async createEstimation(estimationData, userId) {
    try {
      const menuIds = estimationData.selectedMenus.map(m => m.menuId);
      
      // Get recipes for selected menus
      const recipes = await Recipe.find({ menuId: { $in: menuIds }, status: 'active' })
        .populate('ingredients.ingredientId');

      // Get menu details for names
      const menuDetails = await Menu.find({ _id: { $in: menuIds } });
      const menuMap = {};
      menuDetails.forEach(menu => {
        menuMap[menu._id.toString()] = {
          name_en: menu.name_en,
          name_ta: menu.name_ta
        };
      });

      // Build menu ingredients structure
      const menuIngredients = recipes.map(recipe => ({
        menuId: recipe.menuId._id,
        baseMembers: recipe.baseMembers,
        ingredients: recipe.ingredients
      }));

      // Consolidate ingredients
      let consolidatedIngredients = consolidateIngredients(menuIngredients, estimationData.guestCount);

      // Get current rates and ingredient units
      consolidatedIngredients = await Promise.all(
        consolidatedIngredients.map(async (ing) => {
          const ingredient = await Ingredient.findById(ing.ingredientId);
          return {
            ...ing,
            currentRate: ingredient?.currentRate || 0,
            ingredientUnit: ingredient?.unit || 'kg', // The ingredient's base unit
            recipeUnit: ing.unit // The unit used in recipe
          };
        })
      );

      // Calculate costs
      const ingredientWithCosts = calculateIngredientCost(consolidatedIngredients);
      const rawMaterialCost = calculateRawMaterialCost(ingredientWithCosts);

      // Build menu expenses structure
      const menuExpenses = recipes
        .filter(recipe => recipe.expenses && recipe.expenses.length > 0)
        .map(recipe => ({
          menuId: recipe.menuId._id,
          baseMembers: recipe.baseMembers,
          expenses: recipe.expenses
        }));

      // Consolidate expenses
      const consolidatedExpenses = menuExpenses.length > 0
        ? consolidateExpenses(menuExpenses, estimationData.guestCount)
        : [];

      const expenseCost = calculateExpenseCost(consolidatedExpenses);
      
      // Convert flat cost properties to nested additionalCost structure
      const additionalCost = {
        labourCost: estimationData.labourCost || 0,
        gasCost: estimationData.gasCost || 0,
        transportCost: estimationData.transportCost || 0,
        miscellaneousCost: estimationData.miscellaneousCost || 0,
        expenseCost: expenseCost
      };
      
      const costBreakdown = calculateGrandTotal(
        rawMaterialCost,
        additionalCost,
        estimationData.profitMargin || 0
      );

      // Enrich selectedMenus with menu names
      const enrichedSelectedMenus = estimationData.selectedMenus.map(menu => ({
        menuId: menu.menuId,
        menuName_en: menuMap[menu.menuId]?.name_en || 'Unknown',
        menuName_ta: menuMap[menu.menuId]?.name_ta || 'Unknown',
        quantity: menu.quantity || 1
      }));

      // Create estimation document
      const estimation = new Estimation({
        chefName: estimationData.chefName,
        eventDate: estimationData.eventDate,
        eventVenue: estimationData.eventVenue,
        guestCount: estimationData.guestCount,
        selectedMenus: enrichedSelectedMenus,
        ingredients: ingredientWithCosts,
        expenses: consolidatedExpenses,
        rawMaterialCost,
        additionalCost,
        profitMargin: estimationData.profitMargin || 0,
        profitAmount: costBreakdown.profitAmount,
        grandTotal: costBreakdown.grandTotal,
        createdBy: userId
      });

      return await estimation.save();
    } catch (error) {
      throw error;
    }
  }

  async getEstimations(filter = {}, skip = 0, limit = 10) {
    const query = Estimation.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Estimation.countDocuments(filter);
    const estimations = await query;
    return { estimations, total };
  }

  async getEstimationById(id) {
    return await Estimation.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('selectedMenus.menuId')
      .populate('ingredients.ingredientId');
  }

  async updateEstimation(id, updateData) {

  // Fetch existing estimation
  const existingEstimation = await Estimation.findById(id);

  if (!existingEstimation) {
    throw new Error("Estimation not found");
  }

  // Merge existing values with updated values
  const estimationData = {
    chefName: updateData.chefName ?? existingEstimation.chefName,
    eventDate: updateData.eventDate ?? existingEstimation.eventDate,
    eventVenue: updateData.eventVenue ?? existingEstimation.eventVenue,
    guestCount: updateData.guestCount ?? existingEstimation.guestCount,
    selectedMenus: updateData.selectedMenus ?? existingEstimation.selectedMenus,

    labourCost:
      updateData.labourCost ??
      existingEstimation.additionalCost?.labourCost ??
      0,

    gasCost:
      updateData.gasCost ??
      existingEstimation.additionalCost?.gasCost ??
      0,

    transportCost:
      updateData.transportCost ??
      existingEstimation.additionalCost?.transportCost ??
      0,

    miscellaneousCost:
      updateData.miscellaneousCost ??
      existingEstimation.additionalCost?.miscellaneousCost ??
      0,

    profitMargin:
      updateData.profitMargin ??
      existingEstimation.profitMargin ??
      0
  };

  const menuIds = estimationData.selectedMenus.map(m =>
  m.menuId._id ? m.menuId._id : m.menuId
  );
      
      // Get recipes for selected menus
      const recipes = await Recipe.find({ menuId: { $in: menuIds }, status: 'active' })
        .populate('ingredients.ingredientId');

      // Get menu details for names
      const menuDetails = await Menu.find({ _id: { $in: menuIds } });
      const menuMap = {};
      menuDetails.forEach(menu => {
        menuMap[menu._id.toString()] = {
          name_en: menu.name_en,
          name_ta: menu.name_ta
        };
      });

      // Build menu ingredients structure
      const menuIngredients = recipes.map(recipe => ({
        menuId: recipe.menuId._id,
        baseMembers: recipe.baseMembers,
        ingredients: recipe.ingredients
      }));

      // Consolidate ingredients
      let consolidatedIngredients = consolidateIngredients(menuIngredients, estimationData.guestCount);

      // Get current rates and ingredient units
      consolidatedIngredients = await Promise.all(
        consolidatedIngredients.map(async (ing) => {
          const ingredient = await Ingredient.findById(ing.ingredientId);
          return {
            ...ing,
            currentRate: ingredient?.currentRate || 0,
            ingredientUnit: ingredient?.unit || 'kg', // The ingredient's base unit
            recipeUnit: ing.unit // The unit used in recipe
          };
        })
      );

      // Calculate costs
      const ingredientWithCosts = calculateIngredientCost(consolidatedIngredients);
      const rawMaterialCost = calculateRawMaterialCost(ingredientWithCosts);

      // Build menu expenses structure
      const menuExpenses = recipes
        .filter(recipe => recipe.expenses && recipe.expenses.length > 0)
        .map(recipe => ({
          menuId: recipe.menuId._id,
          baseMembers: recipe.baseMembers,
          expenses: recipe.expenses
        }));

      // Consolidate expenses
      const consolidatedExpenses = menuExpenses.length > 0
        ? consolidateExpenses(menuExpenses, estimationData.guestCount)
        : [];

      const expenseCost = calculateExpenseCost(consolidatedExpenses);
      
      // Convert flat cost properties to nested additionalCost structure
      const additionalCost = {
        labourCost: estimationData.labourCost || 0,
        gasCost: estimationData.gasCost || 0,
        transportCost: estimationData.transportCost || 0,
        miscellaneousCost: estimationData.miscellaneousCost || 0,
        expenseCost: expenseCost
      };
      // Calculate grand total
const costBreakdown = calculateGrandTotal(
  rawMaterialCost,
  additionalCost,
  estimationData.profitMargin || 0
);

// Enrich selected menus
const enrichedSelectedMenus = estimationData.selectedMenus.map(menu => ({
  menuId: menu.menuId._id ? menu.menuId._id : menu.menuId,
  menuName_en: menu.menuName_en,
  menuName_ta: menu.menuName_ta,
  quantity: menu.quantity || 1
}));

// Update estimation
const updatedEstimation = await Estimation.findByIdAndUpdate(
  id,
  {
    chefName: estimationData.chefName,
    eventDate: estimationData.eventDate,
    eventVenue: estimationData.eventVenue,
    guestCount: estimationData.guestCount,

    selectedMenus: enrichedSelectedMenus,

    ingredients: ingredientWithCosts,
    expenses: consolidatedExpenses,

    rawMaterialCost,

    additionalCost,

    profitMargin: estimationData.profitMargin,
    profitAmount: costBreakdown.profitAmount,
    grandTotal: costBreakdown.grandTotal,

    updatedAt: new Date()
  },
  {
    new: true
  }
).populate("createdBy", "firstName lastName email");

return updatedEstimation;
      

}

  async deleteEstimation(id) {
    return await Estimation.findByIdAndDelete(id);
  }

  async getEstimationsByUser(userId, skip = 0, limit = 10) {
    return this.getEstimations({ createdBy: userId }, skip, limit);
  }

  async getEstimationsByDateRange(startDate, endDate, skip = 0, limit = 10) {
    return this.getEstimations({
      eventDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }, skip, limit);
  }

  async getEstimationsByCustomer(chefName, skip = 0, limit = 10) {
    return this.getEstimations({
      chefName: { $regex: chefName, $options: 'i' }
    }, skip, limit);
  }

  async getAnalytics(userId, userRole) {
    try {
      const filter = userRole === 'staff' ? { createdBy: userId } : {};
      
      const estimations = await Estimation.find(filter);
      
      const totalEstimations = estimations.length;
      const totalRevenue = estimations.reduce((sum, e) => sum + (e.grandTotal || 0), 0);
      const avgProfitMargin = totalEstimations > 0 
        ? (estimations.reduce((sum, e) => sum + (e.profitMargin || 0), 0) / totalEstimations).toFixed(2)
        : 0;
      
      // Count by status
      const statusCounts = {
        Draft: estimations.filter(e => e.status === 'Draft').length,
        Sent: estimations.filter(e => e.status === 'Sent').length,
        Approved: estimations.filter(e => e.status === 'Approved').length,
        Completed: estimations.filter(e => e.status === 'Completed').length
      };
      
      // Cost comparison by menu
      const menuCosts = {};
      estimations.forEach(est => {
        if (est.selectedMenus && est.selectedMenus.length > 0) {
          est.selectedMenus.forEach(menu => {
            const menuName = menu.menuName_en || 'Unknown';
            if (!menuCosts[menuName]) {
              menuCosts[menuName] = {
                totalEstimates: 0,
                totalProfit: 0,
                avgCostPerGuest: 0,
                profitMargins: []
              };
            }
            menuCosts[menuName].totalEstimates++;
            menuCosts[menuName].totalProfit += est.profitAmount || 0;
            menuCosts[menuName].avgCostPerGuest += (est.rawMaterialCost / est.guestCount) || 0;
            menuCosts[menuName].profitMargins.push(est.profitMargin || 0);
          });
        }
      });
      
      // Calculate averages for menu costs
      Object.keys(menuCosts).forEach(menu => {
        const data = menuCosts[menu];
        data.avgCostPerGuest = (data.avgCostPerGuest / data.totalEstimates).toFixed(2);
        data.avgProfitMargin = (data.profitMargins.reduce((a, b) => a + b, 0) / data.profitMargins.length).toFixed(2);
        delete data.profitMargins;
      });
      
      return {
        statistics: {
          totalEstimations,
          totalRevenue: totalRevenue.toFixed(2),
          avgProfitMargin
        },
        statusDistribution: statusCounts,
        menuAnalytics: menuCosts
      };
    } catch (error) {
      throw error;
    }
  }

  async getEstimationsByIds(ids) {
    try {
      const estimations = await Estimation.find({ _id: { $in: ids } });
      return estimations;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new EstimationService();
