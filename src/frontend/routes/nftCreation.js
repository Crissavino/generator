const express = require('express');
const router = express.Router();
const {
    seeFirstStep,
    postLayersFolder,
    seeSecondStep,
    saveSecondStep,
    seeThirdStep,
    saveThirdStep,
    seeFourthStep,
    saveFourthStep,
    seeFifthStep,
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

router.post(
    '/nft-creation/save-third-step',
    saveThirdStep
);

router.get(
    '/nft-creation/fourth-step',
    seeFourthStep
);

router.post(
    '/nft-creation/save-fourth-step',
    saveFourthStep
);

router.get(
    '/nft-creation/fifth-step',
    seeFifthStep
);

module.exports = router;