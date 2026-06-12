const Medication = require('../models/Medication')
const Patient = require('../models/Patient')

// ────────────────────────────────────────────────────────────
// @route   POST /api/medications
// @desc    Add a medication for the patient
// @access  Private
// ────────────────────────────────────────────────────────────
const addMedication = async (req, res) => {
    try {
        const { name, dose, times, days, notes } = req.body

        if (!name || !dose || !times || times.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Name, dose and at least one time are required'
            })
        }

        // get the patient belonging to this user (optional — meds can exist before profile setup)
        const patient = await Patient.findOne({ user: req.user.id })

        const medication = await Medication.create({
            user: req.user.id,
            ...(patient && { patient: patient._id }),
            name,
            dose,
            times,
            days: days || [0, 1, 2, 3, 4, 5, 6],
            notes: notes || ''
        })

        res.status(201).json({ success: true, data: medication })

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// ────────────────────────────────────────────────────────────
// @route   GET /api/medications
// @desc    Get all medications for logged in user's patient
// @access  Private
// ────────────────────────────────────────────────────────────
const getMedications = async (req, res) => {
    try {
        const medications = await Medication.find({
            user: req.user.id,
            active: true
        })

        res.status(200).json({
            success: true,
            count: medications.length,
            data: medications
        })

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// ────────────────────────────────────────────────────────────
// @route   GET /api/medications/:id
// @desc    Get single medication
// @access  Private
// ────────────────────────────────────────────────────────────
const getMedication = async (req, res) => {
    try {
        const medication = await Medication.findOne({
            _id: req.params.id,
            user: req.user.id    // security — can only get YOUR medications
        })

        if (!medication) {
            return res.status(404).json({
                success: false,
                message: 'Medication not found'
            })
        }

        res.status(200).json({ success: true, data: medication })

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// ────────────────────────────────────────────────────────────
// @route   PUT /api/medications/:id
// @desc    Update a medication
// @access  Private
// ────────────────────────────────────────────────────────────
const updateMedication = async (req, res) => {
    try {
        const medication = await Medication.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        )

        if (!medication) {
            return res.status(404).json({
                success: false,
                message: ' Medication not found'
            })
        }

        res.status(200).json({ success: true, data: medication })

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// ────────────────────────────────────────────────────────────
// @route   DELETE /api/medications/:id
// @desc    Soft delete — sets active to false
// @access  Private
// ────────────────────────────────────────────────────────────
const deleteMedication = async (req, res) => {
    try {
        const medication = await Medication.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { active: false },   // soft delete — data stays in DB
            { new: true }
        )

        if (!medication) {
            return res.status(404).json({
                success: false,
                message: ' Medication not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Medication deleted'
        })

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

module.exports = {
    addMedication,
    getMedications,
    getMedication,
    updateMedication,
    deleteMedication
}