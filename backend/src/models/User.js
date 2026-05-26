const mongoose = require('mongoose');
const bcrypt = require('bcrupt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is reqiured'],
        minLength: [6, 'Password must be at least 6 characters long'],
        select: false
    }
},
    {
        timestamps: true
    });


// ── Hash password before saving ──────────────────────────────
// runs automatically every time a user is saved
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()  // only hash if password changed
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

// ── Method to check password at login ────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}


module.exports = mongoose.model('User', userSchema);