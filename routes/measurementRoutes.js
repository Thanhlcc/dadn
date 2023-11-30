const express = require('express');
const measurementController = require('../controllers/measurementController');
const { IllegalArgumentError } = require('@influxdata/influxdb-client');

const router = express.Router();
router.use('/:measurement', injectFeedName);
/**
 * @swagger
 * tags:
 *  name: Measurements
 *  description: The API for measurements (temperature, humidity, moisture)
 */
/**
 * @swagger
 *  /measurements/{measurement}:
 *      get:
 *          summary: Get temperature values in a certain timeframe
 *          tags:
 *              - Measurements
 *          parameters:
 *            - in: path
 *              name: measurement
 *              schema:
 *                  $ref: '#/components/schemas/Feed'
 *              required: true
 *              description: measurement name to subscribe
 *            - in: query
 *              name: start_time
 *              description: 'start time for the timeframe **(must be a negative number)**'
 *              schema:
 *                  type: number
 *                  default: 0
 *              required: false
 *            - in: query
 *              name: end_time
 *              description: end time for the timeframe **(must be a greater than start_time)**
 *              schema:
 *                  type: number
 *                  default: now()
 *              required: false
 *            - in: query
 *              name: unit
 *              description: |
 *                  Time unit for start_time and end_time
 *
 *                  The possible status are as follows:
 *                    * d: day
 *                    * m: minute
 *                    * s: second
 *              schema:
 *                  type: string
 *                  enum: ['d', 'm', 's']
 *                  default: d
 *              required: false
 *
 *          responses:
 *              '200':
 *                  description: get successfully
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Measurement'
 */
router.route('/:measurement').get(measurementController.getAll);
/**
 * @swagger
 *  /measurements/{measurement}/sse:
 *      get:
 *          summary: Get measurement records in real-time
 *          description: |
 *              This api use Server-sent event communication to keep the client up-to-date with new value
 *
 *              **Try this endpoint in your browser**
 *          tags:
 *              - Measurements
 *          parameters:
 *            - in: path
 *              name: measurement
 *              schema:
 *                  $ref: '#/components/schemas/Feed'
 *              required: true
 *              description: measurement name to subscribe
 *          responses:
 *              '200':
 *                  content:
 *                      text/event-stream:
 *                          schema:
 *                              $ref: '#components/schemas/Sse-response'
 *                          example: "data: {value: 12, timestamp: 1700409774941}"
 *                  description: 'subscribe successfully and the first response wiht an empty body'
 */
router.route('/:measurement/sse').get(measurementController.subscribe);

/*
 * ============ Utility methods ==================
 */
function injectFeedName(req, res, next) {
	if (!req.params.measurement) {
		throw new IllegalArgumentError('Need "feed" in req.params object');
	}
	const feedName = req.params.measurement;
	switch (feedName) {
		case 'temperature':
			req.feedName = process.env.AIO_TEMP_FEED;
			break;
		case 'humidity':
			req.feedName = process.env.AIO_HUMIDITY_FEED;
			break;
		case 'moisture':
			req.feedName = process.env.AIO_MOIS_FEED;
			break;
	}
	req.feedName = req.feedName.toLocaleLowerCase();
	next();
}

module.exports = router;
