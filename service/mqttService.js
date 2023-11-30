const mqtt = require('mqtt');
const Publisher = require('../utils/Publisher');
const Subscriber = require('../utils/Subscriber');
const { writeApi, queryApi } = require('./influxdbService');
const { Point, IllegalArgumentError } = require('@influxdata/influxdb-client');
const { SsePayload } = require('./sseSocket');

class MqttService {
	host = process.env.AIO_HOST;
	credentials = {
		username: process.env.AIO_USERNAME,
		password: process.env.AIO_KEY,
	};
	feeds = [];
	connection = undefined;
	constructor(host = undefined, credentials = {}, feeds = []) {
		// TODO: validate the host address
		this.host = host ? host : this.host;
		if (credentials.username && credentials.password) {
			this.credentials = credentials;
		}
		feeds = feeds.map(
			(feed) =>
				new Publisher(
					MqttService.feed(this, MqttService.normalize(feed))
				)
		);
		this.feeds.push(...feeds);
	}
	connect() {
		const host_address = `mqtt://${this.host}`;
		this.connection = mqtt.connect(host_address, {
			...this.credentials,
			clean: true,
			keepalive: 1000,
			reconnectPeriod: 1000,
			connectTimeout: 30 * 1000,
		});
		const mqttClient = this.connection;
		mqttClient.on('connect', (conack) => {
			if (!conack) {
				throw new Error('Cannot connect to Adafruit');
			} else console.log('Connected to Adafruit');
			const feeds = this.feeds.map((feed) => feed.name);
			mqttClient.subscribe(feeds, (error, granted) => {
				if (error) {
					console.log(error);
					return;
				}
				granted.forEach((subscription) => {
					console.log(
						`NodeJS:Mqtt subscribed: ${subscription.topic}`
					);
				});
			});
		});
		mqttClient.on('error', (error) => {
			console.log(error);
			mqttClient.end(() => {
				console.log('Connection terminated');
			});
		});
		mqttClient.on('reconnect', () => {
			console.log('Reconnecting....');
		});
		mqttClient.on('message', async (topic, message) => {
			topic = MqttService.normalize(topic);
			const feed = this.feeds.find(
				(publisher) => MqttService.normalize(publisher.name) === topic
			);
			if (feed) {
				const currentTime = Date.now();
				const measurement = topic.split('/').pop();
				console.log(`Measurement: ${measurement}`);
				const newPoint = new Point(measurement).tag(
					'feed',
					measurement
				);
				console.log(topic);
				if (
					topic.split('/').pop() ===
						process.env.AIO_BULB_FEED.toLocaleLowerCase() ||
					topic.split('/').pop() ===
						process.env.AIO_PUMPER_FEED.toLocaleLowerCase()
				) {
					newPoint.booleanField('value', parseInt(message));
				} else {
					newPoint.floatField('value', message);
				}
				newPoint.timestamp(currentTime);
				writeApi.writePoint(newPoint);
				await writeApi.flush();
				message = {
					data: message.toString(),
					timestamp: currentTime.toString(),
				};
				feed.notifyAll(message);
			} else {
				throw new TypeError(`unknown topic ${topic}`);
			}
		});
	}
	static feed(mqttService, name) {
		name = MqttService.normalize(name);
		return `nghiango02/feeds/${name}`;
	}
	is_valid_feed(name) {
		name = MqttService.feed(this, name);
		return this.feeds.find((publisher) => publisher.name === name);
	}
	register_new_client(user, feed_name) {
		feed_name = MqttService.feed(this, feed_name);
		const feed = this.feeds.find((feed) => feed.name === feed_name);
		if (feed) {
			const newUser = new Subscriber(user);
			feed.register(newUser);
		} else {
			throw Error(`Invalid feed name ${feed_name}`);
		}
	}
	static normalize(name) {
		if (typeof name !== 'string') {
			throw new TypeError(`${name} must be a string`);
		}
		return name.trim().toLowerCase();
	}
	publish(message, feedName) {
		if (!this.is_valid_feed(feedName)) {
			throw Error(
				`MqttService::publish => unknown feed name ${feedName}`
			);
		}
		const payload = new SsePayload(message);
		this.connection.publish(payload, feedName);
	}
	unregister(res, feedName) {
		feedName = MqttService.feed(this, feedName);
		const targetFeed = this.feeds.find((feed) => feed.name === feedName);
		if (!targetFeed)
			throw new IllegalArgumentError(`Unknown feed name: ${feedName}`);
		targetFeed.unregister(res);
	}
}
/**
 * Configure the mqtt client for listening on Adafruit IO server
 * Three default feeds to be subscribed: 'temperature', 'humidity', 'optical'
 */
const feeds = [
	process.env.AIO_TEMP_FEED,
	process.env.AIO_HUMIDITY_FEED,
	process.env.AIO_BULB_FEED,
	process.env.AIO_PUMPER_FEED,
	process.env.AIO_MOIS_FEED,
];
module.exports = new MqttService(
	process.env.AIO_HOST,
	{
		username: process.env.AIO_USERNAME,
		password: process.env.AIO_KEY,
	},
	feeds
);
