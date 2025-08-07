const mongoose = require('mongoose');

const carePlanSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    assignedCaregiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CaregiverProfile',
        default: null, // Can be unassigned initially
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Pending',
    },
    dueDate: {
        type: Date,
    },
    frequency: {
        type: String, // e.g., 'Daily', 'Weekly', 'As Needed'
    },
    notes: {
        type: String,
    },
}, { timestamps: true });

const CarePlan = mongoose.model('CarePlan', carePlanSchema);

module.exports = CarePlan;
