class Publisher {
    #subscribers = [];
    constructor(name) {
        if(typeof name === 'string'){
            this.name = name;
        }
        else throw new TypeError(`${name} must be a string`);
    }
    register(subscriber){
        if(typeof subscriber === 'object' && subscriber.constructor.name === 'Subscriber'){
            this.#subscribers.push(subscriber);
        }
        else{
            throw new Error("MqttService#resgisterType: Mismatch for subscriber");
        }
    }
    notifyAll(message){
        this.#subscribers.forEach(subscriber => subscriber.update(message));
    }
}

module.exports = Publisher;