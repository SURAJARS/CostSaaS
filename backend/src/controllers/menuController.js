const menuService = require('../services/menuService');
const { validateMenu } = require('../validators');

class MenuController {
  async createMenu(req, res, next) {
    try {
      const { error, value } = validateMenu(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
      }

      const menu = await menuService.createMenu(value);
      res.status(201).json({ success: true, message: 'Menu created successfully', data: menu });
    } catch (error) {
      next(error);
    }
  }

  async getMenus(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const filter = req.query.status ? { status: req.query.status } : {};
      if (req.query.category) filter.category = req.query.category;

      const { menus, total } = await menuService.getMenus(filter, skip, limit);
      res.status(200).json({
        success: true,
        data: menus,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMenuById(req, res, next) {
    try {
      const menu = await menuService.getMenuById(req.params.id);
      if (!menu) {
        return res.status(404).json({ success: false, message: 'Menu not found' });
      }
      res.status(200).json({ success: true, data: menu });
    } catch (error) {
      next(error);
    }
  }

  async updateMenu(req, res, next) {
    try {
      // Remove immutable Mongoose fields from request body
      const { _id, __v, createdAt, updatedAt, ...dataToUpdate } = req.body;
      
      const { error, value } = validateMenu(dataToUpdate);
      if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
      }

      const menu = await menuService.updateMenu(req.params.id, value);
      if (!menu) {
        return res.status(404).json({ success: false, message: 'Menu not found' });
      }
      res.status(200).json({ success: true, message: 'Menu updated successfully', data: menu });
    } catch (error) {
      next(error);
    }
  }

  async deleteMenu(req, res, next) {
    try {
      const menu = await menuService.deleteMenu(req.params.id);
      if (!menu) {
        return res.status(404).json({ success: false, message: 'Menu not found' });
      }
      res.status(200).json({ success: true, message: 'Menu deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async searchMenus(req, res, next) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ success: false, message: 'Search query is required' });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const { menus, total } = await menuService.searchMenus(q, skip, limit);
      res.status(200).json({
        success: true,
        data: menus,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MenuController();
