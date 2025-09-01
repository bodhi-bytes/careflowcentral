// migrateCaregivers.js
import mongoose from "mongoose";

// 1. Connect to MongoDB
mongoose.connect("mongodb+srv://kiranbodhi111:s8z9NCZgL8d5nQBB@cluster0.2sxqsya.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 2. Define Staff Profile Schema
const staffProfileSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  role: String, // caregiver, nurse, admin, etc.
  skills: [String],
  availability: [String],
  createdAt: { type: Date, default: Date.now },
});

const caregiverSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  skills: [String],
  availability: [String],
  movedFromStaff: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// 3. Create Models
const StaffProfile = mongoose.model("StaffProfile", staffProfileSchema, "staffProfiles");
const Caregiver = mongoose.model("Caregiver", caregiverSchema, "caregivers");

// 4. Migration Function
async function migrateCaregivers() {
  try {
    // Find caregivers in staffProfiles
    const caregivers = await StaffProfile.find({ role: "caregiver" });

    if (caregivers.length === 0) {
      console.log("⚠️ No caregivers found in staffProfiles.");
      return;
    }

    // Transform & insert into caregivers collection
    const caregiverDocs = caregivers.map((c) => ({
      name: c.name,
      email: c.email,
      phone: c.phone,
      skills: c.skills,
      availability: c.availability,
      movedFromStaff: true,
      createdAt: c.createdAt,
    }));

    await Caregiver.insertMany(caregiverDocs);
    console.log(`✅ Migrated ${caregivers.length} caregivers.`);

    // (Optional) Delete migrated caregivers from staffProfiles
    // await StaffProfile.deleteMany({ role: "caregiver" });
    // console.log("🗑️ Removed caregivers from staffProfiles.");

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Migration failed:", err);
    mongoose.connection.close();
  }
}

// 5. Run
migrateCaregivers();
