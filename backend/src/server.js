require('dotenv').config({ path: __dirname + '/../.env' })

const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 5000

const start = async () => {
    await connectDB()
    app.listen(PORT, () => {
        console.log(`✅ CareBell server running on port ${PORT}`)
        console.log(`🌐 Health check → http://localhost:${PORT}`)
    })
}

start()



















// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();
// const dns = require("dns");

// dns.setServers(["1.1.1.1", "8.8.8.8"]);

// const app = express();

// app.use(cors());
// app.use(express.json());

// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log("MongoDb connected"))
//     .catch((err) => console.log(err));

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () =>
//     console.log(`server running on port ${PORT}`));