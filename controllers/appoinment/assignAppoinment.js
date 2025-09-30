const Appointment = require("../../models/Appointment");
const Caregiver = require("../../models/Caregiver");
const Notification = require("../../models/notificationSchema"); 

const assignAppointment = async (req, res) => {
  try {
    const { appointmentId, caregiverId } = req.body;

    // find appointment
    const appointment = await Appointment.findById(appointmentId).populate("client");
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found", success: false });
    }

    // find caregiver
    const caregiver = await Caregiver.findById(caregiverId);
    if (!caregiver) {
      return res.status(404).json({ message: "Caregiver not found", success: false });
    }

    // Optional: block if already assigned
    if (caregiver.clientId) {
      return res.status(400).json({ 
        message: "This caregiver already has an assigned appointment", 
        success: false 
      });
    }

    
    appointment.caregiver = caregiver._id;
    appointment.status = "assigned";

    caregiver.clientId = appointment.client?._id;

    // values for notification
    const clientName = appointment.client?.name || "the client";
    const dateTime = appointment.dateTime || new Date().toISOString();

    // Create notification
    const notification = new Notification({
      userId: caregiverId,
      title: "New Appointment Assigned",
      message: `You’ve been assigned a new appointment with ${clientName} on ${dateTime}.`,
      type: "appointment"
    });
    await notification.save();

    // 🔹 Real-time push
    const io = req.app.get("io");
    const connectedUsers = req.app.get("connectedUsers");

    const caregiverSocketId = connectedUsers.get(caregiverId.toString());
    if (caregiverSocketId) {
      io.to(caregiverSocketId).emit("new-notification", notification);
    }

    // save both
    await appointment.save();
    await caregiver.save();

    return res.status(200).json({
      success: true,
      message: "Appointment assigned successfully",
      data: { appointment, caregiver }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, success: false });
  }
};

module.exports =  assignAppointment 
