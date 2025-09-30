require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const { serverConfiguration } = require("./config");
const { port } = serverConfiguration;

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000"], // ✅ add your frontend domain here
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

// Routes
app.use("/users", require("./user.routes")); // legacy
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/staff-onboarding", require("./routes/staffOnboardingRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/clients", require("./routes/clientRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/careplans", require("./routes/carePlanRoutes"));
app.use("/api/caregivers", require("./routes/caregiverRoutes"));
app.use("/api/client", require("./routes/Client/clientRoute")); // separate client side

// Root route for health check
app.get("/", (_req, res) =>
  res.status(200).json({ message: "API v1.0 is running..." })
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// HTTP + Socket.io setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"], // ✅ change to your frontend domain
    methods: ["GET", "POST"],
  },
});

const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Register caregiver/user
  socket.on("register", (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (const [userId, sockId] of connectedUsers.entries()) {
      if (sockId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
    console.log("Socket disconnected:", socket.id);
  });
});

// Make io & connectedUsers accessible in controllers
app.set("io", io);
app.set("connectedUsers", connectedUsers);

// Connect DB then start server
connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`✅ Server running at http://localhost:${port}/`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });
