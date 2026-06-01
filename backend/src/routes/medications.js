const express = require('express')
const router = express.Router()

const {
    addMedication,
    getMedications,
    getMedication,
    updateMedication,
    deleteMedication
} = require('../controllers/medicationController')

const { protect } = require('../middleware/authMiddleware')

router.use(protect)   // all medication routes are private

router.route('/')
    .post(addMedication)
    .get(getMedications)

router.route('/:id')
    .get(getMedication)
    .put(updateMedication)
    .delete(deleteMedication)

module.exports = router