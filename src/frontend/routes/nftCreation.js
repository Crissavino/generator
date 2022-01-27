const express = require('express');
const router = express.Router();
const {
    seeFirstStep
} = require('../controllers/nftCreationController');

router.get(
    '/nft-creation/first-step',
    seeFirstStep
);

module.exports = router;