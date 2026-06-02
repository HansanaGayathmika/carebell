const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    res.status(statusCode).json({
        success: false,
        message: err.message || ' Something went wrong '
    })
}

module.exports = errorHandler
















// // middleware/errorHandler.js
// const errorHandler = (err, req, res, next) => {
//     const statusCode = res.statusCode === 200 ? 500 : res.statusCode

//     res.status(statusCode).json({
//         success: false,
//         message: err.message || 'Something went wrong',
//         // only show full error details during development
//         stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//     })
// }

// module.exports = errorHandler