const express = require('express');
const deviceController = require('../controllers/binaryDeviceController');
const { IllegalArgumentError } = require('@influxdata/influxdb-client');

const router = express.Router();
router.use('/:device', injectFeedName);
/**
 * @swagger
 * tags:
 *  name: Devices
 *  description: The API for devices (pumper and bulb) status and control. Device status is simply 1 (on) or 0 (off)
 */

/**
 * @swagger
 *  /devices/{device}:
 *      get:
 *          summary: Get device status in a certain timeframe
 *          tags:
 *              - Devices
 *          parameters:
 *            - in: path
 *              name: device
 *              schema:
 *                  $ref: '#/components/schemas/Device'
 *              required: true
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
 *          responses:
 *              '200':
 *                  description: get successfully
 *                  contents:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Device'
 */
router.route('/:device').get(deviceController.getAll);
/**
 * @swagger
 *  /devices/{device}/sse:
 *      get:
 *          summary: track the device status in real-time
 *          description: |
 *              This api use Server-sent event communication to keep the client up-to-date with new value
 *
 *              **Try this endpoint in your browser**
 *          tags:
 *              - Devices
 *          parameters:
 *            - in: path
 *              name: device
 *              schema:
 *                  $ref: '#/components/schemas/Device'
 *              required: true
 *          responses:
 *              '200':
 *                  content:
 *                      text/event-stream:
 *                          schema:
 *                              $ref: '#components/schemas/Sse-response'
 *                          example: "data: {value: 1, timestamp: 1700409774941}"
 *                  description: 'subscribe successfully and the first response contains the latest status for the device'
 */
router.route('/:device/sse').get(deviceController.subscribe);
/**
 * @swagger
 *  /devices/{device}/toggle:
 *      get:
 *          summary: toggle the current status of the device
 *          description: |
 *              If the current status of a device is On (1), after calling this api, the device status is Off (0) and vice versa
 *
 *          tags:
 *              - Devices
 *          parameters:
 *            - in: path
 *              name: device
 *              schema:
 *                  $ref: '#/components/schemas/Device'
 *              required: true
 *          responses:
 *              '201':
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#components/schemas/ToggleResponse'
 *                          example: {
 *                                status: 'success',
 *                                message: 'Toggle Successfully',
 *                                data: {
 *                                   value: 0,
 *                                   timestamp: 1700409774941
 *                                }
 *                          }
 *                  description: 'subscribe successfully and the first response contains the latest status for the device'
 */
router.route('/:device/toggle').get(deviceController.toggle);
/*
 * ============ Utility methods ==================
 */
function injectFeedName(req, res, next) {
	if (!req.params.device) {
		throw new IllegalArgumentError('Need "device" in req.params object');
	}
	const device = req.params.device;
	switch (device) {
		case 'pumper':
			req.feedName = process.env.AIO_PUMPER_FEED;
			break;
		case 'bulb':
			req.feedName = process.env.AIO_BULB_FEED;
			break;
	}
	req.feedName = req.feedName.toLocaleLowerCase();
	next();
}

module.exports = router;
