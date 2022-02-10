const {response} = require("express");
const fs = require('fs')
const multer = require("multer");
const mongoose = require("mongoose");
const User = require('../../models/User');
const Project = require('../../models/Project');
const Blockchain = require('../../models/Blockchain');
const NftCollection = require('../../models/NftCollection');
const SplitRoyalty = require('../../models/SplitRoyalty');
const Layer = require('../../models/Layer');
const Variant = require('../../models/Variant');
const {ObjectId} = require("mongodb");

const storageForLayersFolder = multer.diskStorage({
    destination: function (req, file, cb) {
        let splittedFieldName = file.fieldname.split('-');
        if (splittedFieldName[0] !== 'layersFolder') {
            return cb(new Error('Invalid field name'), null);
        }
        let userUuid = splittedFieldName[1]
        let folderStructure = file.originalname.split('/');
        folderStructure.pop();
        folderStructure = folderStructure.join('/');

        fs.mkdirSync(`public/layers/${userUuid}`, {recursive: true});
        fs.chmodSync(`public/layers/${userUuid}`, 0o777);
        fs.mkdirSync(`public/layers/${userUuid}/${folderStructure}`, {recursive: true});
        fs.chmodSync(`public/layers/${userUuid}/${folderStructure}`, 0o777);

        let path = `public/layers/${userUuid}/${folderStructure}`
        console.log(path);

        cb(null, path)
    },
    filename: function (req, file, cb) {
        let folderStructure = file.originalname.split('/');
        folderStructure.shift();
        let fileName = folderStructure.pop();
        cb(null, fileName)
    }
})

const storageForReplaceLayersFolder = multer.diskStorage({
    destination: function (req, file, cb) {
        let splittedFieldName = file.fieldname.split('-');
        if (splittedFieldName[0] !== 'layersFolder') {
            return cb(new Error('Invalid field name'), null);
        }
        let userUuid = splittedFieldName[1]
        let folderStructure = file.originalname.split('/');
        folderStructure.pop();
        folderStructure = folderStructure.join('/');

        fs.mkdirSync(`public/layers/${userUuid}`, {recursive: true});
        fs.chmodSync(`public/layers/${userUuid}`, 0o777);
        fs.mkdirSync(`public/layers/${userUuid}/${folderStructure}`, {recursive: true});
        fs.chmodSync(`public/layers/${userUuid}/${folderStructure}`, 0o777);

        let path = `public/layers/${userUuid}/${folderStructure}`

        cb(null, path)
    },
    filename: function (req, file, cb) {
        let folderStructure = file.originalname.split('/');
        folderStructure.shift();
        let fileName = folderStructure.pop();
        cb(null, fileName)
    }
})

function fileFilter(req, file, cb) {
    if (
        file.mimetype !== 'image/jpeg' &&
        file.mimetype !== 'image/png' &&
        file.mimetype !== 'image/jpg' &&
        file.mimetype !== 'image/gif'
    ) {
        cb(null, false);
        cb(new multer.MulterError('File type not allowed'));
    } else {
        cb(null, true);
    }

}

let uploadLayersFolder = multer({
    preservePath: true,
    fileFilter: fileFilter,
    storage: storageForLayersFolder,
}).any();

let replacingLayersFolder = multer({
    preservePath: true,
    fileFilter: fileFilter,
    storage: storageForReplaceLayersFolder,
}).any();

const seeFirstStep = async (req, res = response) => {
    if (req.session.userUuid && !req.session.projectId) return res.redirect('/nft-creation/second-step');
    if (req.session.userUuid && req.session.projectId) return res.redirect('/nft-creation/third-step');
    try {
        res.render("nft_creation_step_1", {
            pageTitle: "First Step",
            postLayerFolderUrl: '/nft-creation/post-layers-folder'
        });
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

const postLayersFolder = async (req, res = response) => {
    try {
        uploadLayersFolder(req, res, async function (err) {
            if (err) {
                console.log(err)
                res.status(500).json({
                    success: false,
                    message: "File type not allowed",
                });
            }

            let session = req.session;
            let userUuid = req.body.userUuid;
            session.userUuid = userUuid;
            // TODO see real case
            let user = await findUserByUUid(userUuid)
            if (!user) {
                let user = new User({
                    uuid: userUuid
                });

                await User.create(user, (err, user) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            success: false,
                            message: "Server error",
                        });
                    }
                });
            }

            res.status(200).json({
                success: true,
                message: "All files uploaded",
                redirectTo: `/nft-creation/second-step`
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

function getUserUploadedFolder(userUuid, mainFolderName) {
    let layers = []
    fs.readdirSync(`public/layers/${userUuid}/${mainFolderName}`).forEach((folder, index) => {
        layers.push({
            index,
            name: folder,
            path: `public/layers/${userUuid}/${mainFolderName}/${folder}`,
            filesInside: fs.readdirSync(`public/layers/${userUuid}/${mainFolderName}/${folder}`).length,
            files: fs.readdirSync(`public/layers/${userUuid}/${mainFolderName}/${folder}`).map(file => {
                return {
                    completeName: file,
                    name: file.split('.')[0],
                    url: `/layers/${userUuid}/${mainFolderName}/${folder}/${file}`
                }
            })
        })
    })

    return layers
}

const seeSecondStep = async (req, res = response) => {
    let session = req.session;
    let userUuid = session.userUuid;
    if (!userUuid) {
        return res.redirect('/nft-creation/first-step')
    }
    const mainFolderName = fs.readdirSync(`public/layers/${userUuid}`);
    let layers = getUserUploadedFolder(userUuid, mainFolderName);
    try {
        res.render("nft_creation_step_2", {
            pageTitle: "Second Step",
            mainFolderName,
            layers,
            saveSecondStepUrl: '/nft-creation/save-second-step'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }

}

const replaceLayersFolder = async (req, res = response) => {
    try {
        let session = req.session;
        let userUuid = session.userUuid;

        //remove older folder
        fs.readdirSync(`public/layers/${userUuid}`).forEach(folder => {
            console.log(folder)
            fs.rmdirSync(`public/layers/${userUuid}/${folder}`, {recursive: true});
        })

        replacingLayersFolder(req, res, function (err) {
            if (err) {
                console.log(err)
                res.status(500).json({
                    success: false,
                    message: "File type not allowed",
                });
            }

            res.status(200).json({
                success: true,
                message: "New layer folder updated",
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

async function findBlockchainByName(name) {
    if (name === 'solBlockchain') name = 'Solana'
    if (name === 'ethBlockchain') name = 'Ethereum'
    return await Blockchain.findOne({
        name
    }).exec() ?? null;
}

const saveSecondStep = async (req, res = response) => {
    try {
        const {imagesToGenerate, projectName, blockchainSelectedValue} = req.body;
        let session = req.session;
        session.totalNFTToGenerate = imagesToGenerate;
        let userUuid = session.userUuid;
        if (!userUuid) {
            // no user found flash alert
            return res.redirect('/nft-creation/first-step')
        }
        let user = await findUserByUUid(session.userUuid);
        if (!user) {
            // TODO show flash alert
            // no user found
            return res.redirect('/nft-creation/first-step')
        }
        // TODO save data in DB
        let blockchain = await findBlockchainByName(blockchainSelectedValue);
        if (!blockchain) {
            // TODO show flash alert
            // no blockchain found
            return res.redirect('/nft-creation/second-step')
        }
        const mainFolderName = fs.readdirSync(`public/layers/${userUuid}`);
        let project = new Project({
            blockchain: blockchain,
            user: user,
            name: projectName,
            numberToGenerate: imagesToGenerate,
            layersFolderPath: `public/layers/${userUuid}/${mainFolderName}`
        });
        await Project.create(project, (err, project) => {
            console.log(project)
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: false,
                    message: "Server error",
                });
            }

            session.projectId = project._id;

            res.redirect(`/nft-creation/third-step`)
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }

}

async function findProjectsOfUser(user) {
    return await Project.find({
        user
    }).exec() ?? null;
}

async function findProjectById(projectId) {
    return await Project.findById(projectId).exec() ?? null;
}

const seeThirdStep = async (req, res = response) => {
    let session = req.session;
    if (!session.userUuid) {
        // no userUuid found flash alert
        return res.redirect('/nft-creation/first-step')
    }
    if (!session.projectId) {
        // TODO show flash alert
        // no project found
        return res.redirect('/nft-creation/second-step')
    }
    try {
        res.render("nft_creation_step_3", {
            pageTitle: "Fourth Step",
            saveThirdStepUrl: '/nft-creation/save-third-step',
            previousStepUrl: '/nft-creation/second-step'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }

}

function getSplitRoyalties(body) {
    let splitRoyalties = [];
    let totalPercent = 0;
    let allWalletsKeys = Object.getOwnPropertyNames(body).filter(key => key.includes('wallet-'));
    // let allPercentageKeys = Object.getOwnPropertyNames(body).filter(key => key.includes('percentage-'));
    // get all wallet- and percentage- from body
    allWalletsKeys.forEach(key => {
        let wallet_address = body[key];
        let percent = body[`percent-${key.split('-')[1]}`];
        if (wallet_address && percent) {
            splitRoyalties.push({
                wallet_address,
                percent
            });
            totalPercent += parseInt(percent);
        }
    });

    return {
        splitRoyalties,
        totalPercent
    };
}

const saveThirdStep = async (req, res = response) => {
    const {
        collectionName,
        collectionDescription,
        eachImageName,
        collectionFamily,
        collectionSymbol,
        collectionExternalUrl,
        secondRoyalties
    } = req.body;
    let session = req.session;
    let userUuid = session.userUuid;
    if (!userUuid) {
        // no userUuid found flash alert
        return res.redirect('/nft-creation/first-step')
    }
    let projectId = session.projectId;
    if (!projectId) {
        // TODO show flash alert
        // no project found
        return res.redirect('/nft-creation/second-step')
    }
    let {splitRoyalties, totalPercent} = getSplitRoyalties(req.body);
    if (totalPercent !== 100) {
        // TODO show flash alert
        // total percent is not 100
        return res.redirect('/nft-creation/third-step')
    }
    try {
        let nftCollection = new NftCollection({
            project: projectId,
            name: collectionName,
            description: collectionDescription,
            images_name: eachImageName,
            family: collectionFamily,
            symbol: collectionSymbol,
            externalUrl: collectionExternalUrl,
            royaltiesForSecondarySales: secondRoyalties,
        });
        await NftCollection.create(nftCollection, async (err, nftCollection) => {
            if (err) {
                console.log(err);
                // TODO show flash alert
                // saving error
                return res.redirect('/nft-creation/third-step')
            }

            session.nftCollectionId = nftCollection._id;

            for (const splitRoyaltyKey in splitRoyalties) {
                if (splitRoyalties.hasOwnProperty(splitRoyaltyKey)) {
                    let royalty = new SplitRoyalty({
                        nftCollection: nftCollection._id,
                        walletAddress: splitRoyalties[splitRoyaltyKey].wallet_address,
                        percent: splitRoyalties[splitRoyaltyKey].percent
                    });
                    await SplitRoyalty.create(royalty, (err, royalty) => {
                        if (err) {
                            console.log(err);
                            // TODO show flash alert
                            // saving error
                            return res.redirect('/nft-creation/third-step')
                        }
                    });
                }
            }

            const mainFolderName = fs.readdirSync(`public/layers/${userUuid}`);
            let layers = getUserUploadedFolder(userUuid, mainFolderName);
            for (const layersKey in layers) {
                if (layers.hasOwnProperty(layersKey)) {
                    let layer = new Layer({
                        nftCollection: nftCollection._id,
                        name: layers[layersKey].name,
                        path: layers[layersKey].path,
                        variantsNumber: layers[layersKey].filesInside,
                        position: layers[layersKey].index,
                    });

                    await Layer.create(layer, (err, layer) => {
                        if (err) {
                            console.log(err);
                            // TODO show flash alert
                            // saving error
                            return res.redirect('/nft-creation/third-step')
                        }
                    });
                }
            }
            res.redirect(`/nft-creation/fourth-step`)
        });
    } catch (error) {
        console.error(error);
        // TODO show flash alert
        // saving error
        return res.redirect('/nft-creation/third-step')
    }

}

async function findLayersByNftCollectionIdWithLean(nftCollectionId) {
    return await Layer.find({nftCollection: nftCollectionId}).lean().sort({
        position: "asc"
    }).exec();
}

async function findLayersByNftCollectionId(nftCollectionId) {
    return await Layer.find({nftCollection: nftCollectionId}).exec();
}

const seeFourthStep = async (req, res = response) => {
    let session = req.session;
    let userUuid = session.userUuid;
    if (!userUuid) {
        // no userUuid found flash alert
        return res.redirect('/nft-creation/first-step')
    }
    if (!session.projectId) {
        // TODO show flash alert
        // no project found
        return res.redirect('/nft-creation/second-step')
    }
    let nftCollectionId = session.nftCollectionId;
    if (!session.nftCollectionId){
        // TODO show flash alert
        // no nftCollectionId found
        return res.redirect('/nft-creation/third-step');
    }
    // get all layers from nftCollectionId
    let layers = await findLayersByNftCollectionIdWithLean(nftCollectionId);
    try {
        res.render("nft_creation_step_4", {
            pageTitle: "Fourth Step",
            layers,
            saveFourthStepUrl: '/nft-creation/save-fourth-step',
            previousStepUrl: '/nft-creation/third-step'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }

}

const saveFourthStep = async (req, res = response) => {
    let {layersOrdered} = req.body;
    let session = req.session;
    session.layersOrdered = layersOrdered;
    layersOrdered = JSON.parse(layersOrdered);
    try {
        for (const layersOrderedKey in layersOrdered) {
            if (layersOrdered.hasOwnProperty(layersOrderedKey)) {
                let layerOrdered = layersOrdered[layersOrderedKey];
                await Layer.findByIdAndUpdate(layerOrdered._id, {position: layersOrderedKey}, null, (err, layer) => {
                    if (err) {
                        console.log(err);
                        // TODO show flash alert
                        // no saving error
                        return res.redirect('/nft-creation/fourth-step');
                    }
                }).clone();
            }
        }
        res.redirect(`/nft-creation/fifth-step`)
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

function attachVariantsFiles(layers) {
    layers.forEach(layer => {
        layer.filesInside = fs.readdirSync(`${layer.path}`).length;
        layer.files = fs.readdirSync(`${layer.path}`).map(file => {
            // remove the first element of the path
            let path = layer.path.split('/');
            path.shift();
            path = path.join('/');

            return {
                completeName: file,
                name: file.split('.')[0],
                url: `${path}/${file}`
            }
        });
    });

    return layers
}

const seeFifthStep = async (req, res = response) => {
    let session = req.session;
    let userUuid = session.userUuid ?? '06k6c';
    if (!userUuid) {
        // TODO show flash alert
        // no userUuid found flash alert
        return res.redirect('/nft-creation/first-step')
    }
    let projectId = session.projectId;
    if (!projectId) {
        // TODO show flash alert
        // no project found
        return res.redirect('/nft-creation/second-step')
    }
    let nftCollectionId = session.nftCollectionId;
    if (!nftCollectionId) {
        // TODO show flash alert
        // no nftCollectionId found
        return res.redirect('/nft-creation/third-step');
    }
    let project = await Project.findById(projectId).exec();
    let layers = await findLayersByNftCollectionIdWithLean(nftCollectionId);
    layers = attachVariantsFiles(layers);

    try {
        res.render("nft_creation_step_5", {
            pageTitle: "Fifth Step",
            layers,
            saveFifthStepUrl: '/nft-creation/save-fifth-step',
            previousStepUrl: '/nft-creation/fourth-step',
            totalNFTToGenerate: project.numberToGenerate
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

const saveFifthStep = async (req, res) => {
    let {variantsToAllocate} = req.body;
    let session = req.session;
    let userUuid = session.userUuid;
    if (!userUuid) {
        // TODO show flash alert
        // no userUuid found flash alert
        return res.redirect('/nft-creation/first-step')
    }
    let projectId = session.projectId;
    if (!projectId) {
        // TODO show flash alert
        // no project found
        return res.redirect('/nft-creation/second-step')
    }
    let nftCollectionId = session.nftCollectionId;
    if (!nftCollectionId) {
        // TODO show flash alert
        // no nftCollectionId found
        return res.redirect('/nft-creation/third-step');
    }

    try {
        variantsToAllocate = JSON.parse(variantsToAllocate);

        // group variants by layerName
        let variantsGroupedByLayers = [];
        variantsToAllocate.forEach(variant => {
            let layerId = variant.layerId;
            let layerName = variant.layerName;
            let variantName = variant.traitName;
            let variantNumber = variant.variantNumber;
            let traitWithRarity = variant.traitWithRarity;
            let variantToAdd = {
                layer: layerId,
                layerName: layerName,
                variantName: variantName,
                variantNumber: variantNumber,
                traitWithRarity: traitWithRarity
            };
            if (variantsGroupedByLayers[layerName]) {
                variantsGroupedByLayers[layerName].push(variantToAdd);
            } else {
                variantsGroupedByLayers[layerName] = [variantToAdd];
            }
        });

        const mainFolderName = fs.readdirSync(`public/layers/${userUuid}`);

        for (const variantsGroupedByLayersKey in variantsGroupedByLayers) {
            if (variantsGroupedByLayers.hasOwnProperty(variantsGroupedByLayersKey)) {
                const layerFolder = variantsGroupedByLayersKey;
                const variants = variantsGroupedByLayers[layerFolder];
                fs.readdirSync(`public/layers/${userUuid}/${mainFolderName}/${layerFolder}`).forEach((file, index) => {
                    let fileName = file.split('.')[0];
                    let fileExtension = file.split('.')[1];
                    variants.map(async variant => {
                        if (variant.variantName === fileName) {
                            fs.renameSync(
                                `public/layers/${userUuid}/${mainFolderName}/${layerFolder}/${file}`,
                                `public/layers/${userUuid}/${mainFolderName}/${layerFolder}/${variant.traitWithRarity}.${fileExtension}`
                            );

                            let variantToSave = new Variant({
                                layer: mongoose.Types.ObjectId(variant.layer),
                                name: variant.traitName,
                                fileName: `${variant.traitWithRarity}.${fileExtension}`,
                                filePath: `public/layers/${userUuid}/${mainFolderName}/${layerFolder}/${variant.traitWithRarity}.${fileExtension}`,
                                variantNumber: variant.variantNumber
                            });
                            await Variant.create(variantToSave, (err, variantSaved) => {
                                console.log(variantSaved)
                                if (err) {
                                    console.error(err);
                                    // TODO show flash alert
                                    // error saving variant
                                    return res.redirect('/nft-creation/fifth-step');
                                }
                            });
                        }
                    });
                })
            }
        }

        return res.status(200).json({
            success: true,
            message: "Todo bien",
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
    postLayersFolder,
    seeSecondStep,
    replaceLayersFolder,
    saveSecondStep,
    seeThirdStep,
    saveThirdStep,
    seeFourthStep,
    saveFourthStep,
    seeFifthStep,
    saveFifthStep
};