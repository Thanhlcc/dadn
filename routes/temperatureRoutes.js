const express =require('express')
const temperatureController = require('./../controllers/temperatureController');
const router = express.Router();

router.route('/')
    .get(temperatureController.getAll);
router.route('/subscribe')
    .get(temperatureController.subscribe);

module.exports = router;