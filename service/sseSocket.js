const {IllegalArgumentError} = require("@influxdata/influxdb-client");

class SsePayload{
    constructor(message, id, event) {
        try {
            if (id && typeof id !== 'string') id.toString();
            if (event && typeof event !== 'string') event.toString();
            if (typeof message !== 'string') {
                message = typeof message === 'object'
                    ? JSON.stringify(message)
                    : message.toString();
            }
        } catch (error) {
            console.log(error);
            throw new IllegalArgumentError("SSE-message converter: Failed to convert to String");
        }
        this.value = "";
        if(id){
            this.value += `id: ${id}\n`;
        }
        if(event){
            this.value += `event: ${event}\n`;
        }
        if(message){
            this.value += `data: ${message}\n\n`;    
        }
    }
}
exports.createSseSocket = function (req, socket, onOpen=f=>f, onClose) {
    if (!socket) {
        throw new IllegalArgumentError('Require a socket for Sse connection');
    }
    socket.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        "Access-Control-Allow-Origin": "*"
    });
    onOpen(req, socket);
    onClose && socket.on('close', onClose);
};

// Any unknown fields will be ignored
// required: payload.data
exports.sendData = async function (out, payload) {
    if(!(payload instanceof SsePayload)){
        throw new IllegalArgumentError('Payload must be an SsePayload instance');
    }
    out.write(payload.value);
};

exports.SsePayload = SsePayload;