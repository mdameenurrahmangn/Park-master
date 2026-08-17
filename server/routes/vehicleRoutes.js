const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getExpiringVehicles
} = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');
const { uploadVehicle } = require('../middleware/uploadMiddleware');

// Route for expiring vehicles
router.get('/expiring', protect, getExpiringVehicles);

// Main vehicle routes
router.route('/')
  .get(protect, getVehicles)
  .post(
    protect, 
    uploadVehicle.fields([
      { name: 'vehiclePhoto', maxCount: 1 },
      { name: 'rcUpload', maxCount: 1 }
    ]), 
    createVehicle
  );

router.route('/:id')
  .get(protect, getVehicleById)
  .put(
    protect,
    uploadVehicle.fields([
      { name: 'vehiclePhoto', maxCount: 1 },
      { name: 'rcUpload', maxCount: 1 }
    ]),
    updateVehicle
  )
  .delete(protect, deleteVehicle);

module.exports = router;