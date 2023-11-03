require('dotenv').config();
const app = require('./app.js');
const mqttService = require('./service/mqttService');
const db = require('./service/influxdbService');

/**
  * =========Start connection to external services==========
  */
mqttService.connect();
console.log('External Services set up successfully');
/**
 *==========  Start Express web app===========
 */
const port = process.env.PORT || 3000;
app.listen(port, process.env.HOST, () => {
    console.log(`Listening on port ${port}`);
})
/**
 * ============Clean up connections============
 */
process.on('beforeExit', () => {
    db.disconnectInfluxDB().then(() => {
        console.log("Closing Influx DB")
    }).catch(err => {
        console.log(`Closing InfluxDB fail: ${err}`);
    });
    mqttService.connection.end(() => {
        console.log("Unsubscribed from Adafruit IO");
    });
})