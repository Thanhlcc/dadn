require('dotenv').config();
const app = require('./app.js');
const mqttService = require('./service/mqttService');
const { writeApi } = require('./service/influxdbService');

/**
 * =========Start connection to external services==========
 */
mqttService.connect();
/**
 *==========  Start Express web app===========
 */
const port = process.env.PORT || 4000;
const server = app.listen(port, '0.0.0.0', process.env.HOST, () => {
	console.log(`Listening on port ${port}`);
});
/**
 * ============Clean up connections============
 */
process.on('SIGINT', () => {
	console.log('Teardown the server......');
	if (writeApi) {
		writeApi
			.close()
			.then(() => {
				console.log('Closing Influx DB');
			})
			.catch((err) => {
				console.log(`Closing InfluxDB fail: ${err}`);
			});
	}
	mqttService.connection.end(() => {
		console.log('Unsubscribed from Adafruit IO');
	});
	server.close(() => {
		console.log('Express server closed');
	});
});
