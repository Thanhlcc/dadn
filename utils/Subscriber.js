class Subscriber {
    constructor(connection) {
        this.id = Date.now();
        this.connection = connection;
    }
    update(message){
        const data = `data: ${JSON.stringify(message)}\n\n`;
        this.connection.write(data);
    }
}

module.exports = Subscriber;