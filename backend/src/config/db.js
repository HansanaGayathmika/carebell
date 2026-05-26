// config/db.js
const mongoose = require('mongoose')
const dns = require('dns')

// fix for DNS resolution issues on some networks
dns.setDefaultResultOrder('ipv4first')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`✅ MongoDB connected: ${conn.connection.host}`)
    } catch (err) {
        console.error(`❌ MongoDB error: ${err.message}`)
        process.exit(1)
    }
}

module.exports = connectDB