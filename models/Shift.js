const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caregiver',
    required: true,
  },
  dayIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 6,
  },
  timeRange: {
    type: String,
    required: true,
  },
});

const Shift = mongoose.model('Shift', shiftSchema);

module.exports = Shift;
