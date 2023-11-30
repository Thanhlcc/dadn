const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const measurementRoutes = require('./routes/measurementRoutes');
const binaryDeviceRoutes = require('./routes/binaryDeviceRoutes');
const { swaggerOptions } = require('./public/swagger-doc');
const app = express();

const swagerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swagerDocs));

/**
 * ==========Middlewares config===========
 */

app.use(express.json());
app.use(cors());
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

/**
 * =============Routes config===============
 */
app.use('/measurements', measurementRoutes);
app.use('/devices', binaryDeviceRoutes);
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
