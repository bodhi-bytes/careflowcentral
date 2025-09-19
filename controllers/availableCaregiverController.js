const StaffProfile = require('../models/StaffProfile'); // Changed from Caregiver to StaffProfile
const Appointment = require('../models/Appointment');

// @desc    Get all available caregivers (now fetched from StaffProfile)
// @route   GET /api/available-caregivers
// @access  Public
module.exports = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.query;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide date, startTime, and endTime' });
    }

    // Create a date range for the entire day
    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);

    // 1. Get all caregivers (now staff profiles identified as caregivers)
    // ASSUMPTION: Caregivers are identified by 'professionalDetails.positionAppliedFor: 'Caregiver'' and 'status: 'Approved''
    const allCaregivers = await StaffProfile.find({
      'professionalDetails.positionAppliedFor': 'Caregiver',
      status: 'Approved'
    });
    console.log('All potential caregivers (StaffProfiles):', allCaregivers.length, allCaregivers.map(c => c._id));

    // 2. Get all appointments for the given date range
    // IMPORTANT: The Appointment model's 'caregiver' field MUST be updated to reference StaffProfile _id for this filtering to work correctly.
    const appointmentsOnDate = await Appointment.find({
      date: { $gte: startDate, $lte: endDate },
      status: { $in: ['Scheduled', 'Pending'] }
    });
    console.log('Appointments on date:', appointmentsOnDate.length, appointmentsOnDate.map(a => ({ id: a._id, caregiverId: a.caregiver })));

    // Helper function to convert HH:mm time to minutes from midnight
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const requestedStartTimeInMinutes = timeToMinutes(startTime);
    const requestedEndTimeInMinutes = timeToMinutes(endTime);

    // 3. Filter out caregivers with conflicting appointments
    const availableCaregivers = allCaregivers.filter(caregiver => {
      const conflictingAppointment = appointmentsOnDate.find(appointment => {
        // This comparison assumes appointment.caregiver now stores the StaffProfile _id
        const isConflict = appointment.caregiver.toString() === caregiver._id.toString();
        if (isConflict) {
          const appointmentStartTimeInMinutes = timeToMinutes(appointment.startTime);
          const appointmentEndTimeInMinutes = timeToMinutes(appointment.endTime);

          // Check for time overlap
          const hasOverlap = (
            (requestedStartTimeInMinutes >= appointmentStartTimeInMinutes && requestedStartTimeInMinutes < appointmentEndTimeInMinutes) ||
            (requestedEndTimeInMinutes > appointmentStartTimeInMinutes && requestedEndTimeInMinutes <= appointmentEndTimeInMinutes) ||
            (requestedStartTimeInMinutes <= appointmentStartTimeInMinutes && requestedEndTimeInMinutes >= appointmentEndTimeInMinutes)
          );
          if (hasOverlap) {
            console.log('Conflicting appointment found for caregiver', caregiver._id, 'with appointment', appointment._id);
          }
          return hasOverlap;
        }
        return false;
      });
      return !conflictingAppointment;
    });
    console.log('Available caregivers after filtering:', availableCaregivers.length, availableCaregivers.map(c => c._id));

    if (availableCaregivers.length === 0) {
      return res.status(204).send();
    }

    res.json(availableCaregivers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};