const Combo = require('../models/Combo');

class ComboService {
  async createCombo(comboData) {
    const combo = new Combo(comboData);
    return await combo.save();
  }

  async getCombos(filter = {}, skip = 0, limit = 10) {
    const query = Combo.find(filter)
      .populate('selectedMenus.menuId')
      .populate('ingredients.ingredientId')
      .populate('expenses.expenseId')
      .skip(skip)
      .limit(limit);
    const total = await Combo.countDocuments(filter);
    const combos = await query;
    return { combos, total };
  }

  async getComboById(id) {
    return await Combo.findById(id)
      .populate('selectedMenus.menuId')
      .populate('ingredients.ingredientId')
      .populate('expenses.expenseId');
  }

  async updateCombo(id, updateData) {
    return await Combo.findByIdAndUpdate(id, updateData, { new: true })
      .populate('selectedMenus.menuId')
      .populate('ingredients.ingredientId')
      .populate('expenses.expenseId');
  }

  async deleteCombo(id) {
    return await Combo.findByIdAndDelete(id);
  }

  async searchCombos(searchText, skip = 0, limit = 10) {
    const query = {
      $or: [
        { name_en: { $regex: searchText, $options: 'i' } },
        { name_ta: { $regex: searchText, $options: 'i' } }
      ]
    };
    const total = await Combo.countDocuments(query);
    const combos = await Combo.find(query)
      .populate('selectedMenus.menuId')
      .populate('ingredients.ingredientId')
      .populate('expenses.expenseId')
      .skip(skip)
      .limit(limit);
    return { combos, total };
  }

  async getActiveCombos() {
    return await Combo.find({ status: 'active' })
      .populate('selectedMenus.menuId')
      .populate('ingredients.ingredientId')
      .populate('expenses.expenseId');
  }
}

module.exports = new ComboService();
