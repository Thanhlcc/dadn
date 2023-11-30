const {IllegalArgumentError} = require("@influxdata/influxdb-client");
const sseSocket = require('../service/sseSocket');
const {SsePayload} = require("../service/sseSocket");

class Subscriber {
            constructor(connection) {
                this.id = Date.now();
                this.connection = connection;
            }
            async update(message){
                if(!message.timestamp || !message.data){
                    console.log(message);
                    throw new IllegalArgumentError("Subscriber: Invalid message format");
                }
                const payload = new SsePayload(message)
                await sseSocket.sendData(this.connection, payload);
    }
}

module.exports = Subscriber;