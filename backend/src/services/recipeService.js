const Recipe = require('../models/Recipe');

class RecipeService {
  async createRecipe(recipeData) {
    const recipe = new Recipe(recipeData);
    return await recipe.save();
  }

  async getRecipes(filter = {}, skip = 0, limit = 10) {
    const query = Recipe.find(filter)
      .populate('menuId')
      .populate('ingredients.ingredientId')
      .populate('expenses.expenseId')
      .skip(skip)
      .limit(limit);
    const total = await Recipe.countDocuments(filter);
    const recipes = await query;
    return { recipes, total };
  }

  async getRecipeById(id) {
    return await Recipe.findById(id).populate('menuId').populate('ingredients.ingredientId').populate('expenses.expenseId');
  }

  async getRecipeByMenuId(menuId) {
    return await Recipe.findOne({ menuId }).populate('menuId').populate('ingredients.ingredientId').populate('expenses.expenseId');
  }

  async updateRecipe(id, updateData) {
    return await Recipe.findByIdAndUpdate(id, updateData, { new: true })
      .populate('menuId')
      .populate('ingredients.ingredientId')
      .populate('expenses.expenseId');
  }

  async deleteRecipe(id) {
    return await Recipe.findByIdAndDelete(id);
  }

  async getRecipesByMenuIds(menuIds) {
    return await Recipe.find({ menuId: { $in: menuIds }, status: 'active' }).populate('menuId').populate('ingredients.ingredientId').populate('expenses.expenseId');
  }
}

module.exports = new RecipeService();
