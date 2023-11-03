const express = require('express');
const temperatureRoutes = require('./routes/temperatureRoutes');
const humidityRoutes = require('./routes/humidityRoutes');
const morgan = require('morgan')

const app = express();
/**
 * ==========Middlewares config===========
 */
app.use(express.json());
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

/**
 * =============Routes config===============
 */
app.use('/temperatures', temperatureRoutes);
app.use('/humidities', humidityRoutes);

/**
 * =============Exception Handler config===============
 */
// app.all('*', (req, res, next) => {
//     next(new AppError("Unsupported API"));
// })
// app.use((err, req, res, next) => {
//     res.status(err.statusCode).json({
//         status: 'fail',
//         message: err.message
//     });
// });
module.exports = app;