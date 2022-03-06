const express = require('express');
const router = express.Router();
const {isAlreadyRegistered, create, authenticate, logout} = require("../controllers/authController");

router.get(
    `/api/v1/auth/:address`,
    isAlreadyRegistered
);

router.post(
    `/api/v1/auth/create`,
    create
);

router.post(
    `/api/v1/auth/authenticate`,
    authenticate
);

router.get(
    `/api/v1/auth/logout/:userUuid`,
    logout
);

module.exports = router;