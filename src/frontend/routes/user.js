const express = require('express');
const router = express.Router();
const {
    uploadOneNft,
    uploadCollectionMetadataToIpfs
} = require('../controllers/ipfsController');
const {
    seeUserArea,
    seeUserCollection, seeSmartContractCreate, saveSmartContract,
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

router.get(
    '/user/smart-contract/create',
    seeSmartContractCreate
);

router.post(
    '/user/smart-contract/save',
    saveSmartContract
);

module.exports = router;