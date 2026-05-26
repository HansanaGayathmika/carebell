const mogoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Medication name is required'],
        trim: true
    },
    dose: {
        type: String,
        required: [true, 'Medication dose is required'],
        trim: true
    },
    times: {
        type: [String],
        required: [true, 'Medication times are required'],
    },
    days: {
        type: [Number],
        default: [0, 1, 2, 3, 4, 5, 6]
    },
    notes: {
        type: String,
        trim: true
    },
    active: {
        type: Boolean,
        default: true,
    }
});

module.exports = mongoose.model('Medication', medicationSchema);