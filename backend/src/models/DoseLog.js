const mongoose = require('mongoose');

const doseLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    medication: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication',
        required: true
    },
    medicationName: {
        type: String,
    },
    scheduledFor: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'calling', 'confirmed', 'missed'],
        default: 'pending'
    },
    attempts: {
        type: Number,
        default: 0
    },
    confirmedAt: {
        type: Date
    },
    alertSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})


module.exports = mongoose.model('DoseLog', doseLogSchema);