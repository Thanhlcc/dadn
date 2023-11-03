const {InfluxDB, Point} = require("@influxdata/influxdb-client");
const connection = new InfluxDB({
        url: process.env.INFLUX_URL,
        token: process.env.INFLUX_TOKEN
    });
const writeApi = connection.getWriteApi(process.env.INFLUX_ORG, process.env.INFLUX_BUCKET);
const queryApi = connection.getQueryApi(process.env.INFLUX_ORG);
const populateData = (influxWriteApi, times) => {
    if(typeof times === 'number'){
        let temperature = undefined;
        for (let i = 0; i < times; i++) {
            temperature = new Point('temperature')
                .tag('feed_id', 'temperature')
                .floatField('value', Math.random() * 100);
            influxWriteApi.writePoint(temperature);
        }
    }
};
const disconnectInfluxDB = async influxAPI => {
    try {
        await influxAPI.close();
        console.log('Closing Influx db connection...');
    }
    catch(e){
        console.log(e);
    }
}

exports.disconnectInfluxDB = disconnectInfluxDB;
exports.populateData = populateData;
exports.writeApi = writeApi;
exports.queryApi = queryApi;