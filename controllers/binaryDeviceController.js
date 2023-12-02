const mqttClient = require('./../service/mqttService');
const { writeApi } = require('./../service/influxdbService');
const { fetchDataIn, queryNthLatest } = require('../service/influxdbService');
const { createSseSocket, SsePayload } = require('../service/sseSocket');
const { Point } = require('@influxdata/influxdb-client');
/*
 * CAUTION: ServerRequest must contain the feed name for turn the device on/off
 */
exports.toggle = async function (req, res) {
	const query = req.query;
	const data = await queryNthLatest(
		req.feedName,
		1,
		query.start_time,
		query.end_time,
		query.unit
	);
	const currentTime = Date.now();
	console.log(data);
	const newData = data.length ? !data[0]._value : false;
	const newPoint = new Point(req.feedName)
		.tag('feed', req.feedName)
		.booleanField('value', newData)
		.timestamp(currentTime);
	writeApi.writePoint(newPoint);
	await writeApi.flush();
	mqttClient.publish(newData, req.feedName);
	res.status(201).json({
		status: 'success',
		message: 'toggle successfully',
		data: {
			value: newData,
			timestamp: currentTime,
		},
	});
};

exports.subscribe = async function (req, res) {
	const query = req.query;
	// Subscribe the device into the corresponding feed in Adafruit
	// and return the latest device status
	createSseSocket(
		req,
		res,
		async (req, res) => {
			mqttClient.register_new_client(res, req.feedName);
			const data = await queryNthLatest(
				req.feedName,
				1,
				query.start_time,
				query.end_time,
				query.unit
			);
			if (data.length === 0) {
				res.flushHeaders();
			} else {
				const payload = new SsePayload({
					data: data[0]._value,
					timestamp: new Date(Date.parse(data[0]._time)).getTime(),
				});
				res.write(payload.value);
			}
		},
		() => {
			mqttClient.unregister(res, req.feedName);
		}
	);
};

exports.getAll = async function (req, res) {
	const avaiable_units = ['d', 'm', 's', 'custom_range'];
	const query = req.query;
	if (
		Object.keys(query).length !== 0 &&
		(query.start_time > query.end_time ||
			!avaiable_units.includes(query.unit))
	) {
		res.status(404).json({
			status: 'fail',
			message: 'Invalid query param values',
		});
	}
	const result = await fetchDataIn(
		req.feedName,
		query.start_time || 0,
		query.end_time || 0,
		query.unit || 'd'
	);
	res.json({
		status: 'success',
		measurement: req.feedName,
		length: result.length,
		data: result.map((datum) => ({
			value: datum._value,
			timestamp: new Date(Date.parse(datum._time)).getTime(),
		})),
	});
};
