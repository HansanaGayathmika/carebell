const express = require('express')
const cors = require('cors')

const app = express()

// ── Middleware ──────────────────────────────────────────────
app.use(cors())
app.use(express.json())

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'))
app.use('/api/patients', require('./routes/patients'))
app.use('/api/medications', require('./routes/medications'))
app.use('/api/logs', require('./routes/logs'))
app.use('/api/webhook', require('./routes/webhook'))

// ── Health check ────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ status: 'CareBell API is running ✅' })
})

// ── Error handler (always last) ─────────────────────────────
app.use(require('./middleware/errorHandler'))

module.exports = app