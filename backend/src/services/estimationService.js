const Estimation = require('../models/Estimation');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const Menu = require('../models/Menu');
const {
  consolidateIngredients,
  calculateIngredientCost,
  calculateRawMaterialCost,
  calculateGrandTotal
} = require('../utils/calculation');

class EstimationService {
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

      // Get current rates
      consolidatedIngredients = await Promise.all(
        consolidatedIngredients.map(async (ing) => {
          const ingredient = await Ingredient.findById(ing.ingredientId);
          return {
            ...ing,
            currentRate: ingredient?.currentRate || 0
          };
        })
      );

      // Calculate costs
      const ingredientWithCosts = calculateIngredientCost(consolidatedIngredients);
      const rawMaterialCost = calculateRawMaterialCost(ingredientWithCosts);
      
      // Convert flat cost properties to nested additionalCost structure
      const additionalCost = {
        labourCost: estimationData.labourCost || 0,
        gasCost: estimationData.gasCost || 0,
        transportCost: estimationData.transportCost || 0,
        miscellaneousCost: estimationData.miscellaneousCost || 0
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
        customerName: estimationData.customerName,
        mobileNumber: estimationData.mobileNumber,
        eventDate: estimationData.eventDate,
        guestCount: estimationData.guestCount,
        selectedMenus: enrichedSelectedMenus,
        ingredients: ingredientWithCosts,
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
      .populate('selectedMenus.menuId');
  }

  async updateEstimation(id, updateData) {
    return await Estimation.findByIdAndUpdate(id, updateData, { new: true })
      .populate('createdBy', 'firstName lastName email');
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

  async getEstimationsByCustomer(customerName, skip = 0, limit = 10) {
    return this.getEstimations({
      customerName: { $regex: customerName, $options: 'i' }
    }, skip, limit);
  }
}

module.exports = new EstimationService();
