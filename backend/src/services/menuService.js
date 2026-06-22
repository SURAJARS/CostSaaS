const Menu = require('../models/Menu');

class MenuService {
  async createMenu(menuData) {
    const menu = new Menu(menuData);
    return await menu.save();
  }

  async getMenus(filter = {}, skip = 0, limit = 10) {
    const query = Menu.find(filter).skip(skip).limit(limit);
    const total = await Menu.countDocuments(filter);
    const menus = await query;
    return { menus, total };
  }

  async getMenuById(id) {
    return await Menu.findById(id);
  }

  async updateMenu(id, updateData) {
    return await Menu.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteMenu(id) {
    return await Menu.findByIdAndDelete(id);
  }

  async searchMenus(searchText, skip = 0, limit = 10) {
    const query = {
      $or: [
        { name_en: { $regex: searchText, $options: 'i' } },
        { name_ta: { $regex: searchText, $options: 'i' } }
      ]
    };
    const total = await Menu.countDocuments(query);
    const menus = await Menu.find(query).skip(skip).limit(limit);
    return { menus, total };
  }

  async getByCategory(category) {
    return await Menu.find({ category, status: 'active' });
  }
}

module.exports = new MenuService();
