const {
	InfluxDB,
	IllegalArgumentError,
} = require('@influxdata/influxdb-client');
const connection = new InfluxDB({
	url: process.env.INFLUX_URL,
	token: process.env.INFLUX_TOKEN,
});
const writeApi = connection.getWriteApi(
	process.env.INFLUX_ORG,
	process.env.INFLUX_BUCKET,
	'ms'
);
const queryApi = connection.getQueryApi(process.env.INFLUX_ORG);
const fetchDataIn = async (measurement, startTime, endTime, unit) => {
	if (!measurement)
		throw new IllegalArgumentError(
			'InfluxDbService:fetchDateIn ==> require measurement parameter'
		);
	if (InfluxDB.units) if (!startTime) startTime = '-7';
	if (!endTime) endTime = '';
	if (!unit) unit = 'd';

	const flux_q = `
		from(bucket: "dadn")
          |> range(start: ${startTime}${startTime != 0 ? unit : ''}${
		endTime ? `end: ${endTime}` : ''
	})
          |> filter(fn: (r) => r["_measurement"] == "${measurement}")
          |> filter(fn: (r) => r["_field"] == "value")`;
	return await queryApi.collectRows(flux_q);
};

const queryNthLatest = async (measurement, limit, startTime, endTime, unit) => {
	if (!measurement)
		throw new IllegalArgumentError(
			'InfluxDbService:fetchDateIn ==> require measurement parameter'
		);
	if (!startTime) startTime = '0';
	if (!endTime) endTime = 'now()';
	if (!unit) unit = 'd';
	const flux_q = `
        from(bucket: "dadn")
          |> range(start: 0)
          |> filter(fn: (r) => r["_measurement"] == "${measurement}")
          |> filter(fn: (r) => r["_field"] == "value")
          |> tail(n: ${limit})`;
	return await queryApi.collectRows(flux_q);
};

exports.writeApi = writeApi;
exports.queryApi = queryApi;
exports.fetchDataIn = fetchDataIn;
exports.queryNthLatest = queryNthLatest;
exports.connection = connection;
