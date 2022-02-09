const { response } = require("express");

const seeHomePage = async (req, res = response) => {
    const body = req.body;
    try {
        res.render("home", {
            pageTitle: "Home",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }

}

module.exports = {
    seeHomePage,
};