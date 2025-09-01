const express = require('express');
const router = express.Router();
const { staffOnboarding } = require('../controllers/staffOnboardingController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.fields([
    { name: 'idCopy', maxCount: 1 },
    { name: 'certCopy', maxCount: 1 },
    { name: 'licenseCopy', maxCount: 1 },
    { name: 'vaccinationRecords', maxCount: 1 }
]), staffOnboarding);

module.exports = router;