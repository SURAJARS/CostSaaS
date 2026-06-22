const recipeService = require('../services/recipeService');
const { validateRecipe } = require('../validators');

class RecipeController {
  async createRecipe(req, res, next) {
    try {
      const { error, value } = validateRecipe(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
      }

      const recipe = await recipeService.createRecipe(value);
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
      const { error, value } = validateRecipe(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
      }

      const recipe = await recipeService.updateRecipe(req.params.id, value);
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
