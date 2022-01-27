const { response } = require("express");
const pool = require("../database");

const seeFirstStep = async (req, res = response) => {
    const body = req.body;
    try {
        res.render("nft_creation_step_1", {
            pageTitle: "First Step",
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
    seeFirstStep,
};