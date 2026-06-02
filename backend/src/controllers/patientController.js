const Patient = require('../models/Patient')

// ────────────────────────────────────────────────────────────
// @route   POST /api/patients
// @desc    Create patient profile
// @access  Private
// ────────────────────────────────────────────────────────────
const createPatient = async (req, res) => {
    try {
        const { name, phone, language, voiceStyle, retryAttempts, retryInterval } = req.body

        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name and phone number are required'
            })
        }

        // check if user already has a patient
        const existing = await Patient.findOne({ user: req.user.id })
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'You already have a patient profile. Use PUT to update it.'
            })
        }

        const patient = await Patient.create({
            user: req.user.id,   // from JWT token via middleware
            name,
            phone,
            language: language || 'sinhala',
            voiceStyle: voiceStyle || 'warm',
            retryAttempts: retryAttempts || 3,
            retryInterval: retryInterval || 15
        })

        res.status(201).json({ success: true, data: patient })

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// ────────────────────────────────────────────────────────────
// @route   GET /api/patients
// @desc    Get logged in user's patient
// @access  Private
// ────────────────────────────────────────────────────────────
const getPatient = async (req, res) => {
    try {
        const patient = await Patient.findOne({ user: req.user.id })

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'No patient found. Please create one first.'
            })
        }

        res.status(200).json({ success: true, data: patient })

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// ────────────────────────────────────────────────────────────
// @route   PUT /api/patients
// @desc    Update patient profile
// @access  Private
// ────────────────────────────────────────────────────────────
const updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findOneAndUpdate(
            { user: req.user.id },
            req.body,
            { new: true, runValidators: true }
            // new: true      → return updated document not old one
            // runValidators  → check schema rules on update too
        )

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'No patient found'
            })
        }

        res.status(200).json({ success: true, data: patient })

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// ────────────────────────────────────────────────────────────
// @route   DELETE /api/patients
// @desc    Delete patient profile
// @access  Private
// ────────────────────────────────────────────────────────────
const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findOneAndDelete({ user: req.user.id })

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'No patient found'
            })
        }

        res.status(200).json({
            success: true,
            message: ' Patient deleted successfully'
        })

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

module.exports = { createPatient, getPatient, updatePatient, deletePatient }