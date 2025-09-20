const express = require('express');
const { createAppointment } = require('../../controllers/Client/appointment');
const { createMedication } = require('../../controllers/Client/medication');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/appointment',protect, authorize('client'), createAppointment); 


router.post('/medication', createMedication); 



module.exports = router;
