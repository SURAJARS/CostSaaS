const ingredientService = require('../services/ingredientService');
const { validateIngredient } = require('../validators');

class IngredientController {
  async createIngredient(req, res, next) {
    try {
      const { error, value } = validateIngredient(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
      }

      const ingredient = await ingredientService.createIngredient(value);
      res.status(201).json({ success: true, message: 'Ingredient created successfully', data: ingredient });
    } catch (error) {
      next(error);
    }
  }

  async getIngredients(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const filter = req.query.status ? { status: req.query.status } : {};

      const { ingredients, total } = await ingredientService.getIngredients(filter, skip, limit);
      res.status(200).json({
        success: true,
        data: ingredients,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      next(error);
    }
  }

  async getIngredientById(req, res, next) {
    try {
      const ingredient = await ingredientService.getIngredientById(req.params.id);
      if (!ingredient) {
        return res.status(404).json({ success: false, message: 'Ingredient not found' });
      }
      res.status(200).json({ success: true, data: ingredient });
    } catch (error) {
      next(error);
    }
  }

  async updateIngredient(req, res, next) {
    try {
      // Remove immutable Mongoose fields from request body
      const { _id, __v, createdAt, updatedAt, ...dataToUpdate } = req.body;
      
      const { error, value } = validateIngredient(dataToUpdate);
      if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
      }

      const ingredient = await ingredientService.updateIngredient(req.params.id, value);
      if (!ingredient) {
        return res.status(404).json({ success: false, message: 'Ingredient not found' });
      }
      res.status(200).json({ success: true, message: 'Ingredient updated successfully', data: ingredient });
    } catch (error) {
      next(error);
    }
  }

  async deleteIngredient(req, res, next) {
    try {
      const ingredient = await ingredientService.deleteIngredient(req.params.id);
      if (!ingredient) {
        return res.status(404).json({ success: false, message: 'Ingredient not found' });
      }
      res.status(200).json({ success: true, message: 'Ingredient deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async searchIngredients(req, res, next) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ success: false, message: 'Search query is required' });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const { ingredients, total } = await ingredientService.searchIngredients(q, skip, limit);
      res.status(200).json({
        success: true,
        data: ingredients,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IngredientController();
