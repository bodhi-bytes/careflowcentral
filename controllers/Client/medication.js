const Medication = require('../../models/Medication');


exports.createMedication = async (req, res) => {
  try {
    const {
      name,
      dose,
      status,
      frequency,
      customFrequency,
      timeOfDay,
      specificTime,
      repeats,
      repeatEndDate,
      repeatCount,
      instructions,
      patient,
      prescribedBy,
      startDate,
      endDate,
      notes
    } = req.body;
    
    // Validate required fields
    if (!name || !dose || !frequency || !patient) {
      return res.status(400).json({
        success: false,
        message: 'Name, dose, frequency, and patient are required'
      });
    }
    
    const newMedication = new Medication({
      name,
      dose,
      status: status || 'Scheduled',
      frequency,
      customFrequency,
      timeOfDay,
      specificTime,
      repeats: repeats || 'Does not repeat',
      repeatEndDate,
      repeatCount,
      instructions,
      patient,
      prescribedBy,
      startDate: startDate || new Date(),
      endDate,
      notes,
      createdBy: req.userId
    });
    
    // Calculate next dose
    newMedication.calculateNextDose();
    
    await newMedication.save();
    
    await newMedication.populate('patient', 'name');
    await newMedication.populate('prescribedBy', 'name');
    await newMedication.populate('createdBy', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Medication created successfully',
      data: newMedication
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating medication',
      error: error.message
    });
  }
};