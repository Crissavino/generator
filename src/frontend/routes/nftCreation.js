const express = require('express');
const router = express.Router();
const {
    seeFirstStep,
    postLayersFolder,
    seeSecondStep,
    saveSecondStep,
    seeThirdStep,
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

router.post(
    '/nft-creation/save-second-step',
    saveSecondStep
);

router.get(
    '/nft-creation/third-step',
    seeThirdStep
);

module.exports = router;