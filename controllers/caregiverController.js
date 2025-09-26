
const { format } = require('date-fns');
const StaffProfile = require('../models/StaffProfile');
const Appointment = require('../models/Appointment');
const Caregiver = require('../models/Caregiver');
const { default: mongoose } = require('mongoose');

// @desc    Get available caregivers by shift
// @route   GET /api/caregivers/available
// @access  Private
exports.getAvailableCaregivers = async (req, res) => {
  const { date, shift } = req.query;

  if (!date || !shift) {
    return res.status(400).json({ message: 'Date and shift parameters are required' });
  }

  const shiftTimeRanges = {
    morning: { start: '08:00', end: '14:00' },
    afternoon: { start: '14:00', end: '20:00' },
    night: { start: '20:00', end: '23:59' },
  };

  if (!shiftTimeRanges[shift]) {
    return res.status(400).json({ message: `Invalid shift. Available shifts are: ${Object.keys(shiftTimeRanges).join(', ')}` });
  }

  try {
    const requestDate = new Date(date);
    const dayOfWeek = format(requestDate, 'EEEE'); // e.g., 'Monday'

    // Step 1: Find staff profiles with general availability for the shift and day
    const staffProfiles = await StaffProfile.find({
      status: 'Approved',
      'professionalDetails.workAvailability.daysAvailable': new RegExp(dayOfWeek, 'i'),
      'professionalDetails.workAvailability.shiftPreference': new RegExp(shift, 'i')
    }).select('createdBy').lean();

    const potentialCaregiverIds = staffProfiles.map(p => p.createdBy);

    if (potentialCaregiverIds.length === 0) {
      return res.json([]); // No caregivers have general availability
    }

    // Step 2: Find caregivers who are busy with specific appointments
    const shiftStartTime = shiftTimeRanges[shift].start;
    const shiftEndTime = shiftTimeRanges[shift].end;

    const conflictingAppointments = await Appointment.find({
      date: requestDate,
      status: { $in: ['Scheduled', 'Pending'] },
      caregiver: { $in: potentialCaregiverIds }
    }).lean();

    const busyCaregiverIds = new Set();
    conflictingAppointments.forEach(appt => {
      // Check for time overlap: (StartA < EndB) and (EndA > StartB)
      if (appt.startTime < shiftEndTime && appt.endTime > shiftStartTime) {
        busyCaregiverIds.add(appt.caregiver.toString());
      }
    });

    // Step 3: Filter out the busy caregivers
    const availableCaregiverIds = potentialCaregiverIds.filter(id => !busyCaregiverIds.has(id.toString()));

    // Step 4: Fetch full profiles of available caregivers
    const availableCaregivers = await StaffProfile.find({
      createdBy: { $in: availableCaregiverIds }
    });

    console.log(`Found ${availableCaregivers.length} available caregivers for the shift.`);
    res.status(200).json(availableCaregivers);

  } catch (error) {
    console.error('Error fetching available caregivers:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all caregivers
// @route   GET /api/caregivers
// @access  Private (e.g., only authenticated admins)
exports.getAllCaregivers = async (req, res) => {
    try {
        const caregivers = await Caregiver.find({}, 'profile.firstName profile.lastName');
        res.status(200).json({
            success: true,
            count: caregivers.length,
            data: caregivers
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server Error while fetching caregivers' 
        });
    }
};

// Get the current caregiver's profile
exports.getMe = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid caregiver ID'
      });
    }

    // ✅ Find caregiver and optionally populate client details
    const caregiver = await Caregiver.findById(id)
      .populate('clientId') // populate if Client model exists
      .select('-passwordHash'); // hide passwordHash for security

    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found'
      });
    }

    res.status(200).json({
      success: true,
      data: caregiver
    });

  } catch (error) {
    console.error('Error fetching caregiver by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
