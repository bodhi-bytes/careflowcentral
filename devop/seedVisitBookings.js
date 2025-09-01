// seedVisitBookings.js
import mongoose from "mongoose";

// 1. Connect to MongoDB
mongoose.connect("mongodb+srv://kiranbodhi111:s8z9NCZgL8d5nQBB@cluster0.2sxqsya.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 2. Define Schema
const visitBookingSchema = new mongoose.Schema({
  clientId: String,
  caregiverId: String,
  appointmentDate: Date,
  startTime: String,
  endTime: String,
  status: {
    type: String,
    enum: ["scheduled", "in-progress", "completed", "cancelled"],
    default: "scheduled",
  },
  location: {
    address: String,
    latitude: Number,
    longitude: Number,
  },
  evv: {
    checkIn: Date,
    checkOut: Date,
    verified: Boolean,
  },
  tasks: [
    {
      taskName: String,
      completed: Boolean,
    },
  ],
  notes: String,
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 3. Create Model
const VisitBooking = mongoose.model("VisitBooking", visitBookingSchema);

// 4. Generate Demo Data
async function seedData() {
  await VisitBooking.deleteMany(); // clear old demo data

  const demoData = [
    {
      clientId: "client001",
      caregiverId: "caregiverA",
      appointmentDate: new Date("2025-08-23"),
      startTime: "09:00",
      endTime: "11:00",
      status: "scheduled",
      location: {
        address: "123 MG Road, Kannur",
        latitude: 11.8745,
        longitude: 75.3704,
      },
      evv: {
        checkIn: null,
        checkOut: null,
        verified: false,
      },
      tasks: [
        { taskName: "Medication (BP Tablet)", completed: false },
        { taskName: "Check Blood Pressure", completed: false },
        { taskName: "Prepare Breakfast", completed: false },
      ],
      notes: "Morning routine visit",
      tags: ["medication", "vitals"],
    },
    {
      clientId: "client002",
      caregiverId: "caregiverB",
      appointmentDate: new Date("2025-08-23"),
      startTime: "14:00",
      endTime: "16:00",
      status: "in-progress",
      location: {
        address: "45 Beach Road, Thalassery",
        latitude: 11.7489,
        longitude: 75.4920,
      },
      evv: {
        checkIn: new Date("2025-08-23T14:05:00"),
        checkOut: null,
        verified: true,
      },
      tasks: [
        { taskName: "Physiotherapy Exercises", completed: true },
        { taskName: "Lunch Assistance", completed: false },
      ],
      notes: "Focus on leg mobility",
      tags: ["physio", "mobility"],
    },
    {
      clientId: "client003",
      caregiverId: "caregiverA",
      appointmentDate: new Date("2025-08-24"),
      startTime: "18:00",
      endTime: "20:00",
      status: "completed",
      location: {
        address: "78 Temple Road, Payyannur",
        latitude: 12.0936,
        longitude: 75.2021,
      },
      evv: {
        checkIn: new Date("2025-08-24T18:02:00"),
        checkOut: new Date("2025-08-24T19:55:00"),
        verified: true,
      },
      tasks: [
        { taskName: "Evening Walk", completed: true },
        { taskName: "Dinner Preparation", completed: true },
      ],
      notes: "Client was in good mood, enjoyed the walk.",
      tags: ["exercise", "meals", "mood"],
    },
  ];

  await VisitBooking.insertMany(demoData);
  console.log("✅ Demo visit bookings inserted!");
  mongoose.connection.close();
}

// 5. Run
seedData();
