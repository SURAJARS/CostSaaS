const recipeService = require('../services/recipeService');
const { validateRecipe } = require('../validators');
const Menu = require('../models/Menu');
const Ingredient = require('../models/Ingredient');

class RecipeController {
  async createRecipe(req, res, next) {
    try {
      const { error, value } = validateRecipe(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
      }

      // Fetch menu details to get names
      const menu = await Menu.findById(value.menuId);
      if (!menu) {
        return res.status(404).json({ success: false, message: 'Menu not found' });
      }

      // Enrich ingredients with names
      const enrichedIngredients = await Promise.all(
        (value.ingredients || []).map(async (ing) => {
          const ingredient = await Ingredient.findById(ing.ingredientId);
          return {
            ingredientId: ing.ingredientId,
            ingredientName_en: ingredient?.name_en || 'Unknown',
            ingredientName_ta: ingredient?.name_ta || 'Unknown',
            quantity: ing.quantity,
            unit: ing.unit
          };
        })
      );

      // Create enriched recipe data
      const recipeData = {
        menuId: value.menuId,
        menuName_en: menu.name_en,
        menuName_ta: menu.name_ta,
        baseMembers: value.baseMembers,
        ingredients: enrichedIngredients,
        status: value.status || 'active'
      };

      const recipe = await recipeService.createRecipe(recipeData);
      res.status(201).json({ success: true, message: 'Recipe created successfully', data: recipe });
    } catch (error) {
      next(error);
    }
  }

  async getRecipes(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const filter = req.query.status ? { status: req.query.status } : {};

      const { recipes, total } = await recipeService.getRecipes(filter, skip, limit);
      res.status(200).json({
        success: true,
        data: recipes,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecipeById(req, res, next) {
    try {
      const recipe = await recipeService.getRecipeById(req.params.id);
      if (!recipe) {
        return res.status(404).json({ success: false, message: 'Recipe not found' });
      }
      res.status(200).json({ success: true, data: recipe });
    } catch (error) {
      next(error);
    }
  }

  async getRecipeByMenuId(req, res, next) {
    try {
      const recipe = await recipeService.getRecipeByMenuId(req.params.menuId);
      if (!recipe) {
        return res.status(404).json({ success: false, message: 'Recipe not found for this menu' });
      }
      res.status(200).json({ success: true, data: recipe });
    } catch (error) {
      next(error);
    }
  }

  async updateRecipe(req, res, next) {
    try {
      // Remove immutable Mongoose fields from request body
      const { _id, __v, createdAt, updatedAt, ...dataToUpdate } = req.body;
      
      const { error, value } = validateRecipe(dataToUpdate);
      if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
      }

      // Fetch menu details to get names
      const menu = await Menu.findById(value.menuId);
      if (!menu) {
        return res.status(404).json({ success: false, message: 'Menu not found' });
      }

      // Enrich ingredients with names
      const enrichedIngredients = await Promise.all(
        (value.ingredients || []).map(async (ing) => {
          const ingredient = await Ingredient.findById(ing.ingredientId);
          return {
            ingredientId: ing.ingredientId,
            ingredientName_en: ingredient?.name_en || 'Unknown',
            ingredientName_ta: ingredient?.name_ta || 'Unknown',
            quantity: ing.quantity,
            unit: ing.unit
          };
        })
      );

      // Create enriched recipe data
      const recipeData = {
        menuId: value.menuId,
        menuName_en: menu.name_en,
        menuName_ta: menu.name_ta,
        baseMembers: value.baseMembers,
        ingredients: enrichedIngredients,
        status: value.status || 'active'
      };

      const recipe = await recipeService.updateRecipe(req.params.id, recipeData);
      if (!recipe) {
        return res.status(404).json({ success: false, message: 'Recipe not found' });
      }
      res.status(200).json({ success: true, message: 'Recipe updated successfully', data: recipe });
    } catch (error) {
      next(error);
    }
  }

  async deleteRecipe(req, res, next) {
    try {
      const recipe = await recipeService.deleteRecipe(req.params.id);
      if (!recipe) {
        return res.status(404).json({ success: false, message: 'Recipe not found' });
      }
      res.status(200).json({ success: true, message: 'Recipe deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RecipeController();
