const { response } = require("express");
const fs = require("fs");
const User = require('../../models/User');
const NftCollection = require('../../models/NftCollection');
const Nft = require('../../models/Nft');
const {updateJsonFiles} = require("./ipfsController");
const basePath = process.cwd();
const publicLayersPath = basePath + '/public/layers';

const seeUserArea = async (req, res = response) => {
    const userUuid = req.session.userUuid ?? '1tuscb';
    try {
        // get user by uuid with projects, projects with nftCollections, nftCollections with layers and layers with variants
        const user = await User.findOne({ uuid: userUuid }).populate({
            path: 'projects',
            populate: {
                path: 'nftCollections',
                populate: {
                    path: 'layers',
                    populate: {
                        path: 'variants'
                    }
                }
            }
        }).lean();
        console.log(user)
        res.render("user_area", {
            user,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

const seeUserCollection = async (req, res = response) => {
    const nftCollectionId = req.params.nftCollectionId;
    try {
        // get nftCollection by _id, nftCollections with layers ordered by position and layers with variants
        const nftCollection = await NftCollection.findOne({ _id: nftCollectionId }).populate({
            path: 'layers',
            options: { sort: { position: 1 } },
            populate: {
                path: 'variants'
            }
        }).lean();

        const nfts = await Nft.find({ nftCollection: nftCollectionId }).lean();

        res.render("user_collection", {
            nftCollection,
            nfts
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
    seeUserArea,
    seeUserCollection,
};