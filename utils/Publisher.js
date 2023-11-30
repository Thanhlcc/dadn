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
            console.log(`Feed ${this.name}: new subscriber subscribed`);
            this.#subscribers.push(subscriber);
        }
        else{
            throw new Error("MqttService#resgisterType: Mismatch for subscriber");
        }
    }
    notifyAll(message){
        this.#subscribers.forEach(subscriber => subscriber.update(message));
    }
    unregister(subscription){
        const newSubscribers = this.#subscribers.filter(sub => sub.connection !== subscription);
        if(newSubscribers.length === this.#subscribers.length){
            console.log("Unknown subscription");
        }
        else{
            this.#subscribers = newSubscribers;
            console.log(`Feed ${this.name}: one subscriber unsubscribed`);
        }
    }
}

module.exports = Publisher;