const jwt = require('jsonwebtoken');
const User = require("../../models/User");

function authenticateToken(req, res, next) {
    const jwToken = req.session.jwToken

    // redirect to home with error message if no token
    if (!jwToken) {
        return res.redirect('/');
    }

    jwt.verify(
        jwToken,
        process.env.JWT_SECRET,
        {
            algorithms: ['HS256'],
        },
        async (err, decoded) => {
            if (err) {
                console.log(err);
                if (err.name === 'TokenExpiredError') {
                    return res.redirect('/');
                }
                return res.status(500).json({
                    success: false,
                    message: "Server error",
                });
            }

            const userUuid = decoded.uuid;
            const publicAddress = decoded.publicAddress;
            req.user = await User.findOne({uuid: userUuid, publicAddress: publicAddress}).exec()
            req.session.userUuid = userUuid;

            next()
        });

    // jwt.verify(token, process.env.TOKEN_SECRET as string, (err: any, user: any) => {
    //     console.log(err)
    //
    //     if (err) return res.sendStatus(403)
    //
    //     req.user = user
    //
    //     next()
    // })
}

module.exports = authenticateToken