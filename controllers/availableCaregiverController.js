const StaffProfile = require('../models/StaffProfile');
const Appointment = require('../models/Appointment');

module.exports = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.query;
    console.log('Query parameters:', { date, startTime, endTime });

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide date, startTime, and endTime' });
    }

    const requestedStartDateTime = new Date(`${date}T${startTime}:00.000Z`);
    const requestedEndDateTime = new Date(`${date}T${endTime}:00.000Z`);
    console.log('Requested time slot:', { requestedStartDateTime, requestedEndDateTime });

    // Find appointments that conflict with the requested time slot
    const conflictingAppointments = await Appointment.find({
      start: { $lt: requestedEndDateTime },
      end: { $gt: requestedStartDateTime },
      status: { $in: ['scheduled', 'completed'] }
    });
    console.log('Conflicting appointments found:', conflictingAppointments.length);

    const conflictingCaregiverIds = conflictingAppointments.map(app => app.caregiver);
    console.log('Conflicting caregiver IDs:', conflictingCaregiverIds);

    // Find all approved caregivers
    const allApprovedCaregivers = await StaffProfile.find({
      'professionalDetails.positionAppliedFor': 'Caregiver',
      status: 'Approved'
    });
    console.log('All approved caregivers:', allApprovedCaregivers.length, allApprovedCaregivers.map(c => c._id));

    // Find available caregivers by filtering out those with conflicting appointments
    const availableCaregivers = await StaffProfile.find({
      'professionalDetails.positionAppliedFor': 'Caregiver',
      status: 'Approved',
      _id: { $nin: conflictingCaregiverIds }
    });
    console.log('Available caregivers found:', availableCaregivers.length);

    if (availableCaregivers.length === 0) {
      // Sending 200 with empty array for consistency, instead of 204
      return res.status(200).json([]);
    }

    res.json(availableCaregivers);
  } catch (error) {
    console.error('Error fetching available caregivers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};