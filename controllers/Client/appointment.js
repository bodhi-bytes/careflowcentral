// controllers/appointmentsController.js
const Appointment = require('../../models/Appointment');

exports.createAppointment = async (req, res) => {
  try {
    const { title, type, date, time, client, caregiver, notes } = req.body;
    
    // Validate required fields
    if (!title || !date || !time || !client || !caregiver) {
      return res.status(400).json({
        success: false,
        message: 'Title, date, time, client, and caregiver are required'
      });
    }
    
    // Parse date and time into start datetime object
    const startDateTime = new Date(`${date}T${time}`);
    
    // Calculate end time (default to 1 hour duration if not specified)
    const endDateTime = new Date(startDateTime.getTime() + (60 * 60 * 1000));
    
    // Check for scheduling conflicts
    const conflictingAppointment = await Appointment.findOne({
      $or: [
        { 
          caregiver, 
          start: { $lt: endDateTime }, 
          end: { $gt: startDateTime }, 
          status: { $ne: 'cancelled' } 
        },
        { 
          client, 
          start: { $lt: endDateTime }, 
          end: { $gt: startDateTime }, 
          status: { $ne: 'cancelled' } 
        }
      ]
    });
    
    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'Scheduling conflict: The caregiver or client already has an appointment during this time',
        conflict: conflictingAppointment
      });
    }
    
    const newAppointment = new Appointment({
      title,
      type: type || 'Appointment',
      client,
      caregiver,
      start: startDateTime,
      end: endDateTime,
      durationHours: calculateDurationHours(startDateTime, endDateTime),
      notes: notes || '',
      status: 'scheduled',
      createdBy: req.userId
    });
    
    await newAppointment.save();
    
    // Populate the references for the response
    await newAppointment.populate('client', 'name');
    await newAppointment.populate('caregiver', 'name');
    await newAppointment.populate('createdBy', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: newAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message
    });
  }
};

// exports.getAppointments = async (req, res) => {
//   try {
//     const { startDate, endDate, clientId, caregiverId, status, type } = req.query;
//     let filter = {};
    
//     // Date range filter
//     if (startDate && endDate) {
//       filter.start = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       };
//     } else if (startDate) {
//       filter.start = { $gte: new Date(startDate) };
//     } else if (endDate) {
//       filter.start = { $lte: new Date(endDate) };
//     }
    
//     // Client filter
//     if (clientId) {
//       filter.client = clientId;
//     }
    
//     // Caregiver filter
//     if (caregiverId) {
//       filter.caregiver = caregiverId;
//     }
    
//     // Status filter
//     if (status) {
//       filter.status = status;
//     }
    
//     // Type filter
//     if (type) {
//       filter.type = type;
//     }
    
//     const appointments = await Appointment.find(filter)
//       .populate('client', 'name email phone')
//       .populate('caregiver', 'name email phone')
//       .populate('createdBy', 'name')
//       .sort({ start: 1 });
    
//     res.status(200).json({
//       success: true,
//       data: appointments
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching appointments',
//       error: error.message
//     });
//   }
// };

// exports.getAppointmentById = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const appointment = await Appointment.findById(id)
//       .populate('client', 'name email phone address')
//       .populate('caregiver', 'name email phone qualifications')
//       .populate('createdBy', 'name');
    
//     if (!appointment) {
//       return res.status(404).json({
//         success: false,
//         message: 'Appointment not found'
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       data: appointment
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching appointment',
//       error: error.message
//     });
//   }
// };

// exports.updateAppointment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;
    
//     // If updating time, check for conflicts
//     if (updates.date || updates.time || updates.start) {
//       const existingAppointment = await Appointment.findById(id);
//       if (!existingAppointment) {
//         return res.status(404).json({
//           success: false,
//           message: 'Appointment not found'
//         });
//       }
      
//       let start, end;
      
//       if (updates.date || updates.time) {
//         // Handle date/time from UI form
//         const date = updates.date || existingAppointment.start.toISOString().split('T')[0];
//         const time = updates.time || existingAppointment.start.toTimeString().split(' ')[0].substring(0, 5);
        
//         start = new Date(`${date}T${time}`);
//         end = new Date(start.getTime() + (existingAppointment.durationHours * 60 * 60 * 1000));
//       } else if (updates.start) {
//         // Handle direct start/end updates
//         start = new Date(updates.start);
//         end = updates.end ? new Date(updates.end) : new Date(start.getTime() + (existingAppointment.durationHours * 60 * 60 * 1000));
//       } else {
//         start = existingAppointment.start;
//         end = existingAppointment.end;
//       }
      
//       const conflictingAppointment = await Appointment.findOne({
//         _id: { $ne: id },
//         $or: [
//           { 
//             caregiver: existingAppointment.caregiver, 
//             start: { $lt: end }, 
//             end: { $gt: start }, 
//             status: { $ne: 'cancelled' } 
//           },
//           { 
//             client: existingAppointment.client, 
//             start: { $lt: end }, 
//             end: { $gt: start }, 
//             status: { $ne: 'cancelled' } 
//           }
//         ]
//       });
      
//       if (conflictingAppointment) {
//         return res.status(409).json({
//           success: false,
//           message: 'Scheduling conflict: The caregiver or client already has an appointment during this time',
//           conflict: conflictingAppointment
//         });
//       }
      
//       // Update start and end times
//       updates.start = start;
//       updates.end = end;
//       updates.durationHours = calculateDurationHours(start, end);
//     }
    
//     const appointment = await Appointment.findByIdAndUpdate(
//       id,
//       updates,
//       { new: true, runValidators: true }
//     )
//     .populate('client', 'name email phone')
//     .populate('caregiver', 'name email phone')
//     .populate('createdBy', 'name');
    
//     if (!appointment) {
//       return res.status(404).json({
//         success: false,
//         message: 'Appointment not found'
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       message: 'Appointment updated successfully',
//       data: appointment
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error updating appointment',
//       error: error.message
//     });
//   }
// };

// exports.deleteAppointment = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const appointment = await Appointment.findByIdAndDelete(id);
    
//     if (!appointment) {
//       return res.status(404).json({
//         success: false,
//         message: 'Appointment not found'
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       message: 'Appointment deleted successfully'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting appointment',
//       error: error.message
//     });
//   }
// };