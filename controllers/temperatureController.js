const mqttService = require('../service/mqttService');

exports.subscribe = (req, res) => {
    mqttService.register_new_client(res, process.env.AIO_TEMP_FEED);
}

exports.getAll = async (req, res) => {
    try {

    } catch(err){
        console.log(err);
    }
}