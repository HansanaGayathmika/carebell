const User = require('../models/User')
const jwt = require('jsonwebtoken')

// ── helper: create JWT token ─────────────────────────────────
const createToken = (userId) => {
    return jwt.sign(
        { id: userId },                   // payload — what we store inside token
        process.env.JWT_SECRET,           // secret key from .env
        { expiresIn: process.env.JWT_EXPIRE || '7d' }  // token expires in 7 days
    )
}

// ── helper: send token response ─────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
    const token = createToken(user._id)
    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    })
}

// ────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new family member account
// @access  Public
// ────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body

        // check all fields provided
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email and password'
            })
        }

        // check if email already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            })
        }

        // create user — password gets hashed automatically by model
        const user = await User.create({ name, email, password })

        sendTokenResponse(user, 201, res)

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// ────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login and get token
// @access  Public
// ────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        // check fields provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            })
        }

        // find user — include password (it's hidden by default with select:false)
        const user = await User.findOne({ email }).select('+password')
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            })
        }

        // check password using bcrypt
        const isMatch = await user.matchPassword(password)
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            })
        }

        sendTokenResponse(user, 200, res)

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// ────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get currently logged in user
// @access  Private
// ────────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

module.exports = { register, login, getMe }