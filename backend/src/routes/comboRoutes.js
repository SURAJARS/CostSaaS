const express = require('express');
const comboController = require('../controllers/comboController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create (Admin only)
router.post('/', authorize(['admin']), comboController.createCombo.bind(comboController));

// Read
router.get('/search', comboController.searchCombos.bind(comboController));
router.get('/active', comboController.getActiveCombos.bind(comboController));
router.get('/:id', comboController.getComboById.bind(comboController));
router.get('/', comboController.getCombos.bind(comboController));

// Update (Admin only)
router.put('/:id', authorize(['admin']), comboController.updateCombo.bind(comboController));

// Delete (Admin only)
router.delete('/:id', authorize(['admin']), comboController.deleteCombo.bind(comboController));

module.exports = router;
