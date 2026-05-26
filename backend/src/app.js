const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

// Load routes one by one — comment out from bottom up until crash stops
// whichever line causes crash = that file is broken
try {
    app.use('/api/auth', require('./routes/auth'));
    console.log('✅ auth loaded')
    app.use('/api/patients', require('./routes/patients'));
    console.log('✅ patients loaded')
    app.use('/api/medications', require('./routes/medications'));
    console.log('✅ medications loaded')
    app.use('/api/logs', require('./routes/logs'));
    console.log('✅ logs loaded')
    app.use('/api/webhook', require('./routes/webhook'));
    console.log('✅ webhook loaded')
} catch (e) {
    console.log('❌ BROKEN ROUTE:', e.message)
}

app.get('/', (req, res) => {
    res.json({ status: 'CareBell API is running ✅' })
})

app.use(require('./middleware/errorHandler'))

module.exports = app;
















// const express = require('express');
// const cors = require('cors');

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/patients', require('./routes/patients'));
// app.use('/api/medications', require('./routes/medications'));
// app.use('/api/logs', require('./routes/logs'));
// app.use('/api/webhook', require('./routes/webhook'));

// app.get('/', (req, res) => {
//     res.json({ status: 'CareBell API is running' });
// })

// app.use(require('./middleware/errorHandler'));

// module.exports = app;