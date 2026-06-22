const express = require('express');
const ingredientController = require('../controllers/ingredientController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create (Admin only)
router.post('/', authorize(['admin']), ingredientController.createIngredient.bind(ingredientController));

// Read
router.get('/', ingredientController.getIngredients.bind(ingredientController));
router.get('/search', ingredientController.searchIngredients.bind(ingredientController));
router.get('/:id', ingredientController.getIngredientById.bind(ingredientController));

// Update (Admin only)
router.put('/:id', authorize(['admin']), ingredientController.updateIngredient.bind(ingredientController));

// Delete (Admin only)
router.delete('/:id', authorize(['admin']), ingredientController.deleteIngredient.bind(ingredientController));

module.exports = router;
