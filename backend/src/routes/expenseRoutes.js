const express = require('express');
const expenseController = require('../controllers/expenseController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Read
router.get('/', expenseController.getExpenses.bind(expenseController));
router.get('/:id', expenseController.getExpenseById.bind(expenseController));

// Create (Admin only)
router.post('/', authorize(['admin']), expenseController.createExpense.bind(expenseController));

// Update (Admin only)
router.put('/:id', authorize(['admin']), expenseController.updateExpense.bind(expenseController));

// Delete (Admin only)
router.delete('/:id', authorize(['admin']), expenseController.deleteExpense.bind(expenseController));

module.exports = router;
