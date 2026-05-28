const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
    try {
        let token

        // check for token in header: "Authorization: Bearer <token>"
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized — no token'
            })
        }

        // verify token is valid and not expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // attach user to request — available in all controllers as req.user
        req.user = await User.findById(decoded.id)

        next()

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized — invalid token'
        })
    }
}

module.exports = { protect }