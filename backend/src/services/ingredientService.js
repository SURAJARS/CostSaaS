const Ingredient = require('../models/Ingredient');

class IngredientService {
  async createIngredient(ingredientData) {
    const ingredient = new Ingredient(ingredientData);
    return await ingredient.save();
  }

  async getIngredients(filter = {}, skip = 0, limit = 10) {
    const query = Ingredient.find(filter).skip(skip).limit(limit);
    const total = await Ingredient.countDocuments(filter);
    const ingredients = await query;
    return { ingredients, total };
  }

  async getIngredientById(id) {
    return await Ingredient.findById(id);
  }

  async updateIngredient(id, updateData) {
    return await Ingredient.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteIngredient(id) {
    return await Ingredient.findByIdAndDelete(id);
  }

  async searchIngredients(searchText, skip = 0, limit = 10) {
    const query = {
      $or: [
        { name_en: { $regex: searchText, $options: 'i' } },
        { name_ta: { $regex: searchText, $options: 'i' } }
      ]
    };
    const total = await Ingredient.countDocuments(query);
    const ingredients = await Ingredient.find(query).skip(skip).limit(limit);
    return { ingredients, total };
  }

  async getByCategory(category) {
    return await Ingredient.find({ category, status: 'active' });
  }
}

module.exports = new IngredientService();
