const Estimation = require('../models/Estimation');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
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

      // Create estimation document
      const estimation = new Estimation({
        customerName: estimationData.customerName,
        mobileNumber: estimationData.mobileNumber,
        eventDate: estimationData.eventDate,
        guestCount: estimationData.guestCount,
        selectedMenus: estimationData.selectedMenus,
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
