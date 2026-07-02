const comboService = require('../services/comboService');
const { validateCombo } = require('../validators');

class ComboController {
  async createCombo(req, res, next) {
    try {
      const { error, value } = validateCombo(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
      }

      const combo = await comboService.createCombo(value);
      res.status(201).json({ success: true, message: 'Combo created successfully', data: combo });
    } catch (error) {
      next(error);
    }
  }

  async getCombos(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const filter = req.query.status ? { status: req.query.status } : {};

      const { combos, total } = await comboService.getCombos(filter, skip, limit);
      res.status(200).json({
        success: true,
        data: combos,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      next(error);
    }
  }

  async getComboById(req, res, next) {
    try {
      const combo = await comboService.getComboById(req.params.id);
      if (!combo) {
        return res.status(404).json({ success: false, message: 'Combo not found' });
      }
      res.status(200).json({ success: true, data: combo });
    } catch (error) {
      next(error);
    }
  }

  async updateCombo(req, res, next) {
    try {
      // Remove immutable Mongoose fields from request body
      const { _id, __v, createdAt, updatedAt, ...dataToUpdate } = req.body;
      
      const { error, value } = validateCombo(dataToUpdate);
      if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
      }

      const combo = await comboService.updateCombo(req.params.id, value);
      if (!combo) {
        return res.status(404).json({ success: false, message: 'Combo not found' });
      }
      res.status(200).json({ success: true, message: 'Combo updated successfully', data: combo });
    } catch (error) {
      next(error);
    }
  }

  async deleteCombo(req, res, next) {
    try {
      const combo = await comboService.deleteCombo(req.params.id);
      if (!combo) {
        return res.status(404).json({ success: false, message: 'Combo not found' });
      }
      res.status(200).json({ success: true, message: 'Combo deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async searchCombos(req, res, next) {
    try {
      const searchText = req.query.q;
      if (!searchText) {
        return res.status(400).json({ success: false, message: 'Search query is required' });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const { combos, total } = await comboService.searchCombos(searchText, skip, limit);
      res.status(200).json({
        success: true,
        data: combos,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      next(error);
    }
  }

  async getActiveCombos(req, res, next) {
    try {
      const combos = await comboService.getActiveCombos();
      res.status(200).json({ success: true, data: combos });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ComboController();
