const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Patient name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Patient phone number is required'],
        trim: true
    },
    language: {
        type: String,
        enum: ['sinhala', 'tamil', 'english'],
        default: 'sinhala'
    },
    voiceStyle: {
        type: String,
        enum: ['warm', 'calm', 'formal'],
        default: 'warm'
    },
    retryAttempts: {
        type: Number,
        default: 3,
        min: 1,
        max: 5
    },
    retryInterval: {
        type: Number,
        default: 3,
        min: [1, 'Retry interval must be at least 1 day'],
        max: [30, 'Retry interval cannot exceed 30 days']
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Patient', patientSchema);