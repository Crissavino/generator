const express = require('express');
const router = express.Router();
const {
    seeHomePage
} = require('../controllers/indexController');

router.get(
    '/',
    seeHomePage
);

module.exports = router;