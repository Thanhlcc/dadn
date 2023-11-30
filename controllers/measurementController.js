const {fetchDataIn} = require("../service/influxdbService");
const {IllegalArgumentError} = require("@influxdata/influxdb-client");
const mqttService = require("../service/mqttService");
const {createSseSocket} = require("../service/sseSocket");
/*
    * CAUTION: Requirement: all the ServerRequest must have feedName attribute to use these controller methods
 */

exports.getAll = async (req, res) => {
    try {
        checkRequest(req);
        const query = req.query;
        const data = await fetchDataIn(
            req.feedName,
            query.start_time,
            query.end_time,
            query.unit
        );
        res.json({
            status: 'success',
            measurement: req.feedName,
            length: data.length,
            data: data.map(datum => ({
                value: datum._value,
                timestamp: new Date(Date.parse(datum._time)).getTime()
            }))
        })
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }

};

exports.subscribe = async (req, res) => {
    checkRequest(req);
    const onOpen = () => {
        mqttService.register_new_client(res, req.feedName);
        res.flushHeaders();
    }
    const onClose = () => {
        mqttService.unregister(res, req.feedName);
    }
    createSseSocket(req, res, onOpen, onClose);
};
/**
 * ============Utility methods===============
 */
function checkRequest(req) {
    if (!req.feedName) {
        throw new IllegalArgumentError('ServerRequest must have "feedName" attribute');
    }
    switch (req.feedName) {
        case 'bulb':
            req.feedName = process.env.AIO_BULB_FEED;
            break;
        case 'pumper':
            req.feedName = process.env.AIO_PUMPER_FEED;
            break;
    }
}