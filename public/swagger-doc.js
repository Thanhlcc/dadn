const { milliseconds } = require('date-fns');

exports.swaggerOptions = {
	failOnErrors: true,
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'University Infra Management API',
			version: '1.0.0',
			description: 'This api is still under development',
		},
		servers: [
			{
				url: 'http://localhost:4000',
				description: 'Development server',
			},
		],
		components: {
			schemas: {
				Feed: {
					type: 'string',
					enum: ['temperature', 'humidity', 'moisture'],
				},
				Device: {
					type: 'string',
					enum: ['pumper', 'bulb'],
				},
				Measurement: {
					type: 'object',
					properties: {
						status: {
							type: 'string',
							enum: ['success', 'fail'],
						},
						length: {
							type: 'number',
							format: 'integer',
							description: 'number of data points',
						},
						measurement: {
							$ref: '#/components/schemas/Feed',
							description: 'measurement name',
						},

						data: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									value: {
										type: 'number',
										format: 'float',
										description: 'value of a measurement',
									},
									timestamp: {
										type: 'number',
										description:
											'timestamp at the moment the value is collected (in milliseconds)',
									},
								},
							},
							description: 'values of the measurement',
						},
					},
					example: {
						status: 'success',
						measurement: 'yolo-humidity',
						length: 4,
						data: [
							{
								value: 55,
								timestamp: 1700409600640,
							},
							{
								value: 33,
								timestamp: 1700409608587,
							},
							{
								value: 55,
								timestamp: 1700409769431,
							},
							{
								value: 22,
								timestamp: 1700409774941,
							},
						],
					},
				},
				'Sse-response': {
					type: 'string',
					description:
						'SSE response is in string format and has one mandatory field is data, the other ones (id and event) are optional',
					examples: {
						example1: {
							value: 'id 1, event: signal, data: 2',
						},
						example2: {
							value: 'event: signal, data: 2',
						},
						example3: {
							value: 'data: 2',
						},
					},
				},
				ToggleResponse: {
					type: 'object',
					properties: {
						status: {
							type: 'string',
							enum: ['success', 'fail'],
						},
						message: {
							type: 'string',
						},
						data: {
							type: 'object',
							properties: {
								value: {
									type: 'boolean',
									description: 'current status of the device',
								},
								timestamp: {
									type: 'string',
									description: 'timestamp of the action',
								},
							},
							description: 'The latest device status',
						},
					},
				},
			},
		},
	},
	apis: ['./routes/*Routes.js'],
};
