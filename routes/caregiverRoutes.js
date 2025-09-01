const express = require('express');
const router = express.Router();
const Caregiver = require('../models/Caregiver');
const Shift = require('../models/Shift'); // Assuming you have a Shift model
const { parse, isWithinInterval } = require('date-fns');
const { protect, authorize } = require('../middleware/authMiddleware');
const caregiverController = require('../controllers/caregiverController');

// GET all caregivers
router.get('/', protect, authorize('admin'), caregiverController.getAllCaregivers);

// Example of a protected route for caregivers
router.get('/me', protect, authorize('caregiver'), caregiverController.getMe);

// GET available caregivers
router.get('/available', async (req, res) => {
  const { time } = req.query;

  if (!time) {
    return res.status(400).json({ message: 'Time parameter is required' });
  }

  try {
    const visitTime = parse(time, 'h:mm a', new Date());
    const dayIndex = visitTime.getDay();

    const allCaregivers = await Caregiver.find();
    const allShifts = await Shift.find({ dayIndex });

    const availableCaregivers = allCaregivers.filter(caregiver => {
      const caregiverShifts = allShifts.filter(shift => shift.staffId.toString() === caregiver._id.toString());
      if (caregiverShifts.length === 0) {
        return true; // No shifts on this day, so available
      }

      const isBusy = caregiverShifts.some(shift => {
        const [startTime, endTime] = shift.timeRange.split(' - ');
        const shiftStart = parse(startTime, 'HH:mm', new Date());
        const shiftEnd = parse(endTime, 'HH:mm', new Date());
        return isWithinInterval(visitTime, { start: shiftStart, end: shiftEnd });
      });

      return !isBusy;
    });

    res.json(availableCaregivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;