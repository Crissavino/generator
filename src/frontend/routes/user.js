const express = require('express');
const router = express.Router();
const {
    uploadOneNft,
    uploadCollectionMetadataToIpfs
} = require('../controllers/ipfsController');
const {
    seeUserArea,
    seeUserCollection, seeSmartContractCreate, saveSmartContract, isAlreadyRegistered, login, create, authenticate
} = require('../controllers/userController');


router.get(
    '/user/area/:userUuid',
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

router.get(
    `/api/v1/users/:address`,
    isAlreadyRegistered
);

router.post(
    `/api/v1/users/create`,
    create
);

router.post(
    `/api/v1/users/authenticate`,
    authenticate
);

module.exports = router;