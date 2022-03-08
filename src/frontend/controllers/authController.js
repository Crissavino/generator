const {response} = require("express");
const User = require("../../models/User");
const ethUtil = require("ethereumjs-util");
const jwt = require('jsonwebtoken');

const isAlreadyRegistered = async (req, res = response) => {
    // get the address from the request parameters
    const address = req.params.address
    try {

        const user = await User.findOne({ publicAddress: address }).exec();
        if (user) {
            return res.status(200).json({
                success: true,
                user: user,
                message: "User already registered",
            });
        } else {
            return res.status(200).json({
                success: false,
                message: "User not registered",
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

const login = async (req, res = response) => {
    // get the address from the request parameters
    const address = req.params.address
    try {


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

async function findUserByUUid(userUuid) {
    return await User.findOne({
        uuid: userUuid
    }).exec() ?? null;
}

const create = async (req, res = response) => {
    // get the address from the request parameters
    const publicAddress = req.body.publicAddress
    const userUuid = req.body.userUuid
    try {
        let user = await findUserByUUid(userUuid)
        if (!user) {
            let user = new User({
                uuid: userUuid,
                publicAddress: publicAddress,
            });

            await User.create(user, (err, newUser) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        success: false,
                        message: "Server error",
                    });
                }

                user = newUser;
            });
        }

        jwt.sign(
            {
                payload: {
                    uuid: user.uuid,
                    publicAddress,
                },
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d',
                algorithm: 'HS256',
                header: {
                    typ: 'JWT',
                    alg: 'HS256',
                },
            },
            async (err, token) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        success: false,
                        message: "Server error",
                    });
                }
                user.publicAddress = publicAddress;
                user.nonce = Math.floor(Math.random() * 1000000);
                user.jwToken = token;
                req.session.jwToken = token;
                await user.save();
                return res.status(200).json({
                    success: true,
                    token,
                    user,
                    message: "User registered",
                });
            }
        );

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

const authenticate = async (req, res = response) => {
    // get the address from the request parameters
    const publicAddress = req.body.publicAddress
    const msg = req.body.msg
    const nonce = req.body.nonce
    const isLogin = req.body.isLogin ?? false
    const signature = req.body.signature
    try {

        const msgBuffer = ethUtil.toBuffer('0x'+Buffer.from(msg).toString('hex'));
        const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
        const signatureBuffer = ethUtil.toBuffer(signature);
        const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
        const publicKey = ethUtil.ecrecover(
            msgHash,
            signatureParams.v,
            signatureParams.r,
            signatureParams.s
        );
        const addressBuffer = ethUtil.publicToAddress(publicKey);
        const address = ethUtil.bufferToHex(addressBuffer);

        // The signature verification is successful if the address found with
        // sigUtil.recoverPersonalSignature matches the initial publicAddress
        if (address.toLowerCase() === publicAddress.toLowerCase()) {
            const user = await User.findOne({ publicAddress: address }).exec();
            if (user) {
                // change nonce value of user for security reasons
                // verify jwt token
                jwt.verify(
                    user.jwToken,
                    process.env.JWT_SECRET,
                    {
                        algorithms: ['HS256'],
                    },
                    async (err, decoded) => {
                        console.log({decoded});

                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            success: false,
                            message: "Server error",
                        });
                    }
                    if (decoded.payload.publicAddress === publicAddress) {
                        // update JWT token
                        if (isLogin) {
                            // update the json web token
                            jwt.sign(
                                {
                                    payload: {
                                        uuid: user.uuid,
                                        publicAddress,
                                    },
                                },
                                process.env.JWT_SECRET,
                                {
                                    expiresIn: '1d',
                                    algorithm: 'HS256',
                                    header: {
                                        typ: 'JWT',
                                        alg: 'HS256',
                                    },
                                },
                                async (err, token) => {
                                    if (err) {
                                        console.log(err);
                                        return res.status(500).json({
                                            success: false,
                                            message: "Server error",
                                        });
                                    }
                                    user.publicAddress = publicAddress;
                                    user.nonce = Math.floor(Math.random() * 1000000);
                                    user.jwToken = token;
                                }
                            );
                        }
                        req.session.jwToken = user.jwToken;
                        req.session.isAuthenticated = true;
                        req.session.authUser = user;
                        // change nonce value of user for security reasons
                        user.nonce = Math.floor(Math.random() * 1000000);
                        await user.save();
                        return res.status(200).json({
                            success: true,
                            user,
                            message: "User authenticated",
                        });
                    } else {
                        return res.status(401).json({
                            success: false,
                            message: "Invalid nonce",
                        });
                    }
                });

            } else {
                return res.status(200).json({
                    success: false,
                    message: "User not registered",
                });
            }
        } else {
            return res
                .status(401)
                .send({ error: 'Signature verification failed' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

const logout = async (req, res) => {
    const userUuid = req.params.userUuid
    try {
        const user = await User.findOne({uuid: userUuid }).exec();
        if (user) {
            user.nonce = Math.floor(Math.random() * 1000000);
            await user.save();
            req.session.destroy();
            return res.redirect('/');
        } else {
            console.log('User not found');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

module.exports = {
    isAlreadyRegistered,
    login,
    create,
    authenticate,
    logout,
};