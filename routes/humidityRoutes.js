const express = require('express')
const humidityController = require('./../controllers/humidityController');
const router = express.Router();
router.route('/').get(humidityController.getAll);
module.exports = router;