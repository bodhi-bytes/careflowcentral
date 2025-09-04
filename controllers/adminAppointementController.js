// controllers/appointmentController.js
const Appointment = require("../models/Appointment");
const Client = require("../models/Client");
const Caregiver = require("../models/Caregiver");

//  Get all clients
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find({ status: "Active" })
      .select("personalInfo.firstName personalInfo.lastName contactDetails.email status")
      .lean();

    res.status(200).json(clients);
  } catch (err) {
    res.status(500).json({ message: "Error fetching clients", error: err.message });
  }
};

//  Get all caregivers
exports.getAllCaregivers = async (req, res) => {
  try {
    const caregivers = await Caregiver.find({ status: "active" })
      .select("email profile status")
      .lean();

    res.status(200).json(caregivers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching caregivers", error: err.message });
  }
};

//  Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const { clientId, caregiverId, date, startTime, durationHours, notes } = req.body;

    if (!clientId || !caregiverId || !date || !startTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

    const appointment = await Appointment.create({
      client: clientId,
      caregiver: caregiverId,
      start,
      end,
      durationHours,
      notes,
      createdBy: req.user ? req.user._id : null // if admin logged in
    });

    res.status(201).json({
      message: "Appointment created successfully",
      appointment
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating appointment", error: err.message });
  }
};
