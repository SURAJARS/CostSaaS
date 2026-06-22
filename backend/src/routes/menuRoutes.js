const express = require('express');
const menuController = require('../controllers/menuController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create (Admin only)
router.post('/', authorize(['admin']), menuController.createMenu.bind(menuController));

// Read
router.get('/', menuController.getMenus.bind(menuController));
router.get('/search', menuController.searchMenus.bind(menuController));
router.get('/:id', menuController.getMenuById.bind(menuController));

// Update (Admin only)
router.put('/:id', authorize(['admin']), menuController.updateMenu.bind(menuController));

// Delete (Admin only)
router.delete('/:id', authorize(['admin']), menuController.deleteMenu.bind(menuController));

module.exports = router;
