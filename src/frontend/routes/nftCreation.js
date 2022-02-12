const express = require('express');
const router = express.Router();
const {
    seeFirstStep,
    postLayersFolder,
    seeSecondStep,
    replaceLayersFolder,
    saveSecondStep,
    seeThirdStep,
    saveThirdStep,
    seeFourthStep,
    saveFourthStep,
    seeFifthStep,
    saveFifthStep,
    seeCreationConfirmed,
} = require('../controllers/nftCreationController');


router.get(
    '/nft-creation/first-step',
    seeFirstStep
);

router.post(
    '/nft-creation/post-layers-folder',
    postLayersFolder
);

router.post(
    '/nft-creation/replace-layers-folder',
    replaceLayersFolder
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

router.post(
    '/nft-creation/save-fifth-step',
    saveFifthStep
);

router.get(
    '/nft-creation/confirmed',
    seeCreationConfirmed
);

module.exports = router;