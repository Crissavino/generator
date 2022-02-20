const express = require('express');
const router = express.Router();
const {
    uploadOneNft,
    uploadCollectionMetadataToIpfs
} = require('../controllers/ipfsController');
const {
    seeUserArea,
    seeUserCollection,
} = require('../controllers/userController');


router.get(
    '/user/area',
    seeUserArea
);

router.get(
    '/user/collection/:nftCollectionId',
    seeUserCollection
);

router.post(
    '/ipfs/upload-one-file',
    uploadOneNft
);

router.post(
    '/ipfs/upload-collection-metadata',
    uploadCollectionMetadataToIpfs
);

// router.post(
//     '/nft-creation/post-layers-folder',
//     postLayersFolder
// );

module.exports = router;