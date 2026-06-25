const Expense = require('../models/Expense');
const { validateExpense } = require('../validators');

class ExpenseController {
  async getExpenses(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const search = req.query.search || '';

      let query = {};
      if (search) {
        query = { $text: { $search: search } };
      }

      const total = await Expense.countDocuments(query);
      const expenses = await Expense.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: expenses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpenseById(req, res, next) {
    try {
      const expense = await Expense.findById(req.params.id);

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      res.status(200).json({
        success: true,
        data: expense
      });
    } catch (error) {
      next(error);
    }
  }

  async createExpense(req, res, next) {
    try {
      const { error, value } = validateExpense(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const expense = await Expense.create(value);

      res.status(201).json({
        success: true,
        data: expense,
        message: 'Expense created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateExpense(req, res, next) {
    try {
      const { error, value } = validateExpense(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const expense = await Expense.findByIdAndUpdate(
        req.params.id,
        value,
        { new: true, runValidators: true }
      );

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      res.status(200).json({
        success: true,
        data: expense,
        message: 'Expense updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteExpense(req, res, next) {
    try {
      const expense = await Expense.findByIdAndDelete(req.params.id);

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      res.status(200).json({
        success: true,
        data: expense,
        message: 'Expense deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExpenseController();
