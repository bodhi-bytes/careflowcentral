const express = require('express');
const router = express.Router();
const {
  createCaregiverProfile,
  getAllCaregiverProfiles,
  getCaregiverProfileById,
  updateCaregiverProfile,
  deleteCaregiverProfile,
} = require('../controllers/caregiverController');

router.post('/', createCaregiverProfile);
router.get('/', getAllCaregiverProfiles);
router.get('/:id', getCaregiverProfileById);
router.put('/:id', updateCaregiverProfile);
router.delete('/:id', deleteCaregiverProfile);

module.exports = router;
