const express = require('express');
const router = express.Router();
const {
    seeFirstStep,
    postLayersFolder,
    seeSecondStep
} = require('../controllers/nftCreationController');


router.get(
    '/nft-creation/first-step',
    seeFirstStep
);

router.post(
    '/nft-creation/post-layers-folder',
    postLayersFolder
);

router.get(
    '/nft-creation/second-step',
    seeSecondStep
);

module.exports = router;