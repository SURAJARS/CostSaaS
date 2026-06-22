const express = require('express');
const recipeController = require('../controllers/recipeController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create (Admin only)
router.post('/', authorize(['admin']), recipeController.createRecipe.bind(recipeController));

// Read
router.get('/', recipeController.getRecipes.bind(recipeController));
router.get('/:id', recipeController.getRecipeById.bind(recipeController));
router.get('/menu/:menuId', recipeController.getRecipeByMenuId.bind(recipeController));

// Update (Admin only)
router.put('/:id', authorize(['admin']), recipeController.updateRecipe.bind(recipeController));

// Delete (Admin only)
router.delete('/:id', authorize(['admin']), recipeController.deleteRecipe.bind(recipeController));

module.exports = router;
