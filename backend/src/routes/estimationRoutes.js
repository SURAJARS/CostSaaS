const express = require('express');
const estimationController = require('../controllers/estimationController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create
router.post('/', estimationController.createEstimation.bind(estimationController));

// Read
router.get('/', estimationController.getEstimations.bind(estimationController));
router.get('/:id', estimationController.getEstimationById.bind(estimationController));

// Update
router.put('/:id', estimationController.updateEstimation.bind(estimationController));

// Delete (Admin only)
router.delete('/:id', authorize(['admin']), estimationController.deleteEstimation.bind(estimationController));

// Export
router.get('/:id/export/excel', estimationController.exportToExcel.bind(estimationController));
router.get('/:id/export/pdf', estimationController.exportToPdf.bind(estimationController));

// Reports
router.get('/report/date-range', estimationController.getReportsByDateRange.bind(estimationController));
router.get('/report/customer', estimationController.getReportsByCustomer.bind(estimationController));

module.exports = router;
