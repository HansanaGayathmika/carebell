const express = require('express')
const router = express.Router()

const {
    createPatient,
    getPatient,
    updatePatient,
    deletePatient
} = require('../controllers/patientController')

const { protect } = require('../middleware/authMiddleware')

// all patient routes are private — must be logged in
router.use(protect)   // ← applies protect to ALL routes below

router.post('/', createPatient)
router.get('/', getPatient)
router.put('/', updatePatient)
router.delete('/', deletePatient)

module.exports = router