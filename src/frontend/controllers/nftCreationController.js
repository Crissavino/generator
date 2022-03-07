const {response, json} = require("express");
const fs = require('fs')
const multer = require("multer");
const mongoose = require("mongoose");
const {spawn} = require('child_process')
const User = require('../../models/User');
const Project = require('../../models/Project');
const Blockchain = require('../../models/Blockchain');
const NftCollection = require('../../models/NftCollection');
const SplitRoyalty = require('../../models/SplitRoyalty');
const Layer = require('../../models/Layer');
const Variant = require('../../models/Variant');
const Nft = require('../../models/Nft');
const {uploadCollectionMetadataToIpfs, uploadEntireCollectionToIpfs} = require("./ipfsController");
const basePath = process.cwd();
const publicLayersPath = basePath + '/public/layers';

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

        fs.mkdirSync(`${publicLayersPath}/${userUuid}`, {recursive: true});
        fs.chmodSync(`${publicLayersPath}/${userUuid}`, 0o777);
        fs.mkdirSync(`${publicLayersPath}/${userUuid}/${folderStructure}`, {recursive: true});
        fs.chmodSync(`${publicLayersPath}/${userUuid}/${folderStructure}`, 0o777);

        let path = `${publicLayersPath}/${userUuid}/${folderStructure}`

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

        fs.mkdirSync(`${publicLayersPath}/${userUuid}`, {recursive: true});
        fs.chmodSync(`${publicLayersPath}/${userUuid}`, 0o777);
        fs.mkdirSync(`${publicLayersPath}/${userUuid}/${folderStructure}`, {recursive: true});
        fs.chmodSync(`${publicLayersPath}/${userUuid}/${folderStructure}`, 0o777);

        let path = `${publicLayersPath}/${userUuid}/${folderStructure}`

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
        !file.originalname.includes('.DS_Store') &&
        file.mimetype !== 'image/jpeg' &&
        file.mimetype !== 'image/png' &&
        file.mimetype !== 'image/jpg' &&
        file.mimetype !== 'image/gif'
    ) {
        cb(null, false);
        cb(new multer.MulterError('File type not allowed'));
    } else if (!file.originalname.includes('.DS_Store')) {
        cb(null, true);
    } else {
        cb(null, false);
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
            currentActive: 1,
            postLayerFolderUrl: '/nft-creation/post-layers-folder',
            layerSampleFolderPath: '/layers.zip'
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

            const userUuid = req.body.userUuid;
            req.session.userUuid = userUuid;
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
    fs.readdirSync(`${publicLayersPath}/${userUuid}/${mainFolderName}`).forEach((folder, index) => {
        layers.push({
            index,
            name: folder,
            path: `${publicLayersPath}/${userUuid}/${mainFolderName}/${folder}`,
            filesInside: fs.readdirSync(`${publicLayersPath}/${userUuid}/${mainFolderName}/${folder}`).length,
            files: fs.readdirSync(`${publicLayersPath}/${userUuid}/${mainFolderName}/${folder}`).map(file => {
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

function getMainFolderName(userUuid) {
    const mainFolderName = fs.readdirSync(`${publicLayersPath}/${userUuid}`);
    // remove .DS_Store
    if (mainFolderName.indexOf('.DS_Store') > 0) mainFolderName.splice(mainFolderName.indexOf('.DS_Store'), 1);
    // sort folders by the oldest
    mainFolderName.sort((a, b) => {
        return fs.statSync(`${publicLayersPath}/${userUuid}/${a}`).mtime.getTime() - fs.statSync(`${publicLayersPath}/${userUuid}/${b}`).mtime.getTime();
    });
    return mainFolderName[0];
}

const seeSecondStep = async (req, res = response) => {
    let session = req.session;
    // req.session.destroy();
    let userUuid = session.userUuid;
    if (!userUuid) {
        return res.redirect('/nft-creation/first-step')
    }
    const mainFolderName = getMainFolderName(userUuid);
    let layers = getUserUploadedFolder(userUuid, mainFolderName);
    // get the number of variants inside each layer
    let totalNftsAbleToGenerate = 0; // we get this number multipling the number of variants inside each layer
    layers.forEach(layer => {
        if (totalNftsAbleToGenerate === 0) {
            totalNftsAbleToGenerate = layer.filesInside;
        } else {
            totalNftsAbleToGenerate *= layer.filesInside;
        }
    })

    try {
        res.render("nft_creation_step_2", {
            pageTitle: "Second Step",
            mainFolderName,
            layers,
            currentActive: 2,
            saveSecondStepUrl: '/nft-creation/save-second-step',
            totalNftsAbleToGenerate
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
        fs.readdirSync(`${publicLayersPath}/${userUuid}`).forEach(folder => {
            console.log(folder)
            fs.rmdirSync(`${publicLayersPath}/${userUuid}/${folder}`, {recursive: true});
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
        if (imagesToGenerate > 20) {
            return res.status(500).json({
                success: false,
                message: "You can't generate more than 20 images, for now 🥲...",
            });
        }
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
        const mainFolderName = getMainFolderName(userUuid);
        let project = new Project({
            blockchain: blockchain,
            user: user,
            name: projectName,
            numberToGenerate: imagesToGenerate,
            layersFolderPath: `${publicLayersPath}/${userUuid}/${mainFolderName}`
        });
        await Project.create(project, (err, project) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: false,
                    message: "Server error",
                });
            }

            session.projectId = project._id;

            // add project to user
            user.projects.push(project);
            user.save();

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

async function findNftCollectionById(nftCollectionId) {
    return await NftCollection.findById(nftCollectionId).exec() ?? null;
}

const seeThirdStep = async (req, res = response) => {
    let session = req.session;
    // session.destroy();
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
            currentActive: 3,
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
            description: collectionDescription.toString().trim(),
            imagesName: eachImageName.toString().toUpperCase(),
            family: collectionFamily,
            symbol: collectionSymbol,
            externalUrl: collectionExternalUrl,
            royaltiesForSecondarySales: secondRoyalties,
        });

        let royaltiesToSaveInNftCollection = [];
        let layersToSaveInNftCollection = [];
        await NftCollection.create(nftCollection, async (err, nftCollection) => {
            console.log('nftCollection')
            console.log(nftCollection)
            if (err) {
                console.log(err);
                // TODO show flash alert
                // saving error
                return res.redirect('/nft-creation/third-step')
            }

            session.nftCollectionId = nftCollection._id;

            // add nftCollection to project
            let project = await findProjectById(projectId);
            project.nftCollections.push(nftCollection._id);
            await project.save();

            let royaltiesToSave = [];
            for (let i = 0; i < splitRoyalties.length; i++) {
                let royalty = new SplitRoyalty({
                    nftCollection: nftCollection._id,
                    walletAddress: splitRoyalties[i].wallet_address,
                    percent: splitRoyalties[i].percent
                });
                royaltiesToSave.push(royalty);

            }

            await SplitRoyalty.insertMany(royaltiesToSave, (err, royalties) => {
                console.log('royalties')
                console.log(royalties)
                if (err) {
                    console.log(err);
                    // TODO show flash alert
                    // saving error
                    return res.redirect('/nft-creation/third-step')
                }

                royaltiesToSaveInNftCollection = royalties;

            });

            const mainFolderName = getMainFolderName(userUuid);
            let layers = getUserUploadedFolder(userUuid, mainFolderName);
            let layersToInsert = [];
            for (let i = 0; i < layers.length; i++) {
                let layer = new Layer({
                    nftCollection: nftCollection._id,
                    name: layers[i].name,
                    path: layers[i].path,
                    variantsNumber: layers[i].filesInside,
                    position: layers[i].index,
                });
                console.log('entra layer ' + layers[i].name)
                layersToInsert.push(layer);
            }

            console.log('salio del for')
            await Layer.insertMany(layersToInsert, async (err, layers) => {
                console.log('layers')
                console.log(layers)
                if (err) {
                    console.log(err);
                    // TODO show flash alert
                    // saving error
                    return res.redirect('/nft-creation/third-step')
                }

                let nftCollectionToUpdate = await findNftCollectionById(session.nftCollectionId);
                nftCollectionToUpdate.layers = layers;
                nftCollectionToUpdate.splitRoyalties = royaltiesToSaveInNftCollection;
                await nftCollectionToUpdate.save();
                return res.redirect(`/nft-creation/fourth-step`)
            });
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
    if (!session.nftCollectionId) {
        // TODO show flash alert
        // no nftCollectionId found
        return res.redirect('/nft-creation/third-step');
    }
    // get all layers from nftCollectionId
    let layers = await findLayersByNftCollectionIdWithLean(nftCollectionId);

    try {
        res.render("nft_creation_step_4", {
            pageTitle: "Fourth Step",
            currentActive: 4,
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
        for (let i = 0; i < layersOrdered.length; i++) {
            let layerOrdered = layersOrdered[i];
            await Layer.findByIdAndUpdate(layerOrdered._id, {position: i}, null, (err, layer) => {
                console.log('layerOrdered')
                console.log(layer)
                if (err) {
                    console.log(err);
                    // TODO show flash alert
                    // no saving error
                    return res.redirect('/nft-creation/fourth-step');
                }
            }).clone();
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
    let project = await Project.findById(projectId).exec();
    let layers = await findLayersByNftCollectionIdWithLean(nftCollectionId);
    layers = attachVariantsFiles(layers);

    try {
        res.render("nft_creation_step_5", {
            pageTitle: "Fifth Step",
            currentActive: 5,
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
    let project = await Project.findById(projectId).exec();

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

        const mainFolderName = getMainFolderName(userUuid);

        for (const variantsGroupedByLayersKey in variantsGroupedByLayers) {
            if (variantsGroupedByLayers.hasOwnProperty(variantsGroupedByLayersKey)) {
                const layerFolder = variantsGroupedByLayersKey;
                const variants = variantsGroupedByLayers[layerFolder];
                fs.readdirSync(`${publicLayersPath}/${userUuid}/${mainFolderName}/${layerFolder}`).forEach((file, index) => {
                    let fileName = file.split('.')[0];
                    let fileExtension = file.split('.')[1];
                    variants.map(async variant => {
                        if (variant.variantName === fileName) {
                            fs.renameSync(
                                `${publicLayersPath}/${userUuid}/${mainFolderName}/${layerFolder}/${file}`,
                                `${publicLayersPath}/${userUuid}/${mainFolderName}/${layerFolder}/${variant.traitWithRarity}.${fileExtension}`
                            );

                            let variantToSave = new Variant({
                                layer: mongoose.Types.ObjectId(variant.layer),
                                name: variant.traitName,
                                fileName: `${variant.traitWithRarity}.${fileExtension}`,
                                filePath: `${publicLayersPath}/${userUuid}/${mainFolderName}/${layerFolder}/${variant.traitWithRarity}.${fileExtension}`,
                                variantNumber: variant.variantNumber,
                                variantPercent: Math.round((variant.variantNumber / project.numberToGenerate) * 100)
                            });
                            await Variant.create(variantToSave, (err, variantSaved) => {
                                console.log(variantSaved)
                                if (err) {
                                    console.error(err);
                                    // TODO show flash alert
                                    // error saving variant
                                    return res.redirect('/nft-creation/fifth-step');
                                }

                                // add variant to layer
                                Layer.findById(variant.layer, (err, layer) => {
                                    if (err) {
                                        console.error(err);
                                        // TODO show flash alert
                                        // error saving variant
                                        return res.redirect('/nft-creation/fifth-step');
                                    }
                                    layer.variants.push(variantSaved._id);
                                    layer.save((err, layerSaved) => {
                                        if (err) {
                                            console.error(err);
                                            // TODO show flash alert
                                            // error saving variant
                                            return res.redirect('/nft-creation/fifth-step');
                                        }
                                        console.log(layerSaved);
                                    });
                                });
                            });
                        }
                    });
                })
            }
        }

        await startCreation(userUuid, projectId, nftCollectionId);

        // return res.redirect('/react/nft-creation/confirmed');
        return res.redirect('/nft-creation/confirmed');

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

async function createNfts(userUuid, nftCollectionId) {
    // get public user folder
    const publicUserFolder = `${publicLayersPath}/${userUuid}`;
    // get nftCollection by id
    let nftCollection = await findNftCollectionById(nftCollectionId);

    // get images inside build folder
    let nftsToInsert = [];
    fs.readdirSync(`${publicUserFolder}/build/images`).forEach( file => {
        let fileIndex = file.split('.')[0];
        let nft = new Nft({
            nftCollection: nftCollectionId,
            name: nftCollection.imagesName+' #'+fileIndex,
            imagePath: `${publicUserFolder}/build/images/${file}`,
            imageRelativePath: `/layers/${userUuid}/build/images/${file}`,
            metadata: fs.readFileSync(`${publicUserFolder}/build/json/${fileIndex}.json`, 'utf8'),
            metadataPath: `${publicUserFolder}/build/json/${fileIndex}.json`,
            metadataRelativePath: `/layers/${userUuid}/build/json/${fileIndex}.json`,
        });

        nftsToInsert.push(nft);
    })

    await Nft.insertMany(nftsToInsert, (err, nftsSaved) => {
        if (err) {
            console.error(err);
            // TODO show flash alert
            // error saving variant
        }
        console.log(nftsSaved);
    });

    // update metadata on nftCollection
    nftCollection.metadata = fs.readFileSync(`${publicUserFolder}/build/json/_metadata.json`, 'utf8');
    nftCollection.metadataPath = `${publicUserFolder}/build/json/_metadata.json`;
    nftCollection.metadataRelativePath = `/layers/${userUuid}/build/json/_metadata.json`;
    await nftCollection.save((err, nftCollectionSaved) => {
        if (err) {
            console.error(err);
            // TODO show flash alert
            // error saving variant
        }
        console.log(nftCollectionSaved);
        // call to uploadCollectionMetadataToIpfs function from ipfsController
        uploadEntireCollectionToIpfs(userUuid, nftCollectionId);
    });
}

function createUtilsFolder(userUuid) {
    // copy utils folder content inside public/layers/userUuid/ folder
    const utilsUserFolderPath = publicLayersPath + '/' + userUuid + '/utils';
    if (!fs.existsSync(utilsUserFolderPath)) {
        fs.mkdirSync(utilsUserFolderPath);
        fs.chmodSync(utilsUserFolderPath, 0o777);
    }
    const utilsExampleFolderPath = basePath + '/utilsExample';
    const files = fs.readdirSync(utilsExampleFolderPath);
    files.forEach(file => {
        fs.copyFileSync(utilsExampleFolderPath + '/' + file, utilsUserFolderPath + '/' + file);
    });

    let generateMetadataFile = fs.readFileSync(`${utilsUserFolderPath}/generate_metadata.js`, 'utf8');
    generateMetadataFile = generateMetadataFile.replaceAll("PUBLIC_USER_FOLDER", `${publicLayersPath}/${userUuid}`);
    fs.writeFileSync(`${utilsUserFolderPath}/generate_metadata.js`, generateMetadataFile);

    let pixelateFile = fs.readFileSync(`${utilsUserFolderPath}/pixelate.js`, 'utf8');
    pixelateFile = pixelateFile.replaceAll("PUBLIC_USER_FOLDER", `${publicLayersPath}/${userUuid}`);
    fs.writeFileSync(`${utilsUserFolderPath}/pixelate.js`, pixelateFile);

    let previewFile = fs.readFileSync(`${utilsUserFolderPath}/preview.js`, 'utf8');
    previewFile = previewFile.replaceAll("PUBLIC_USER_FOLDER", `${publicLayersPath}/${userUuid}`);
    fs.writeFileSync(`${utilsUserFolderPath}/preview.js`, previewFile);

    let previewGifFile = fs.readFileSync(`${utilsUserFolderPath}/preview_gif.js`, 'utf8');
    previewGifFile = previewGifFile.replaceAll("PUBLIC_USER_FOLDER", `${publicLayersPath}/${userUuid}`);
    previewGifFile = previewGifFile.replace("HASHLIPSGIFFER_MODULE", `${basePath}/modules/HashlipsGiffer.js`);
    fs.writeFileSync(`${utilsUserFolderPath}/preview_gif.js`, previewGifFile);

    let rarityFile = fs.readFileSync(`${utilsUserFolderPath}/rarity.js`, 'utf8');
    rarityFile = rarityFile.replaceAll("PUBLIC_USER_FOLDER", `${publicLayersPath}/${userUuid}`);
    fs.writeFileSync(`${utilsUserFolderPath}/rarity.js`, rarityFile);

    let updateInfoFile = fs.readFileSync(`${utilsUserFolderPath}/update_info.js`, 'utf8');
    updateInfoFile = updateInfoFile.replaceAll("PUBLIC_USER_FOLDER", `${publicLayersPath}/${userUuid}`);
    fs.writeFileSync(`${utilsUserFolderPath}/update_info.js`, updateInfoFile);
}

function createPrincipalsScripts(userUuid, blockchain, nftCollection, creatorsForMetadata, layerConfigurations) {
    // copy the runnerExample.js file inside the user folder in publicLayersPath
    let runnerFile = fs.readFileSync(`${basePath}/src/runnerExample.js`, 'utf8');
    runnerFile = runnerFile.replace("USER_MAIN_FILE_PATH", `${publicLayersPath}/${userUuid}/main.js`);
    fs.writeFileSync(`${publicLayersPath}/${userUuid}/runner.js`, runnerFile);

    // copy the config.js file inside the user folder in publicLayersPath
    let configFile = fs.readFileSync(`${basePath}/src/configExample.js`, 'utf8');
    configFile = configFile.replace("NETWORK_TO_USE", blockchain.shortName);
    configFile = configFile.replace("NFT_COLLECTION_NAME", nftCollection.name);
    configFile = configFile.replace("NFT_COLLECTION_DESCRIPTION", nftCollection.description);
    configFile = configFile.replace("NFT_COLLECTION_SYMBOL", nftCollection.symbol);
    configFile = configFile.replace("NFT_COLLECTION_ROYALTIES_FOR_SECOND_SALES", nftCollection.royaltiesForSecondarySales);
    configFile = configFile.replace("NFT_COLLECTION_EXTERNAL_URL", nftCollection.externalUrl);
    configFile = configFile.replace("NFT_COLLECTION_CREATORS", JSON.stringify(creatorsForMetadata));
    configFile = configFile.replace("BLEND_MODE", `${basePath}/constants/blend_mode.js`);
    configFile = configFile.replace("GROW_EDITION_SIZE_TO", layerConfigurations.growEditionSizeTo);
    configFile = configFile.replace("LAYERS_ORDER", JSON.stringify(layerConfigurations.layersOrdered));
    fs.writeFileSync(`${publicLayersPath}/${userUuid}/config.js`, configFile);

    let mainFolderName = getMainFolderName(userUuid);
    // copy the mainExample.js file inside the user folder in publicLayersPath
    let mainFile = fs.readFileSync(`${basePath}/src/mainExample.js`, 'utf8');
    mainFile = mainFile.replace("USER_BUILD_DIR_PATH", `${publicLayersPath}/${userUuid}/build`);
    mainFile = mainFile.replace("USER_LAYERS_DIR_PATH", `${publicLayersPath}/${userUuid}/${mainFolderName}`);
    mainFile = mainFile.replace("USER_CONFIG_FILE_PATH", `${publicLayersPath}/${userUuid}/config.js`);
    mainFile = mainFile.replace("HASHLIPSGIFFER_MODULE", `${basePath}/modules/HashlipsGiffer.js`);
    mainFile = mainFile.replaceAll("USER_UUID", userUuid);
    fs.writeFileSync(`${publicLayersPath}/${userUuid}/main.js`, mainFile);
}

function createPreviewGifImage(userUuid) {
    const previewGifFile = publicLayersPath + '/' + userUuid + '/utils/preview_gif.js';
    let runner = spawn('node', [`${previewGifFile}`]);
    runner.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
    });
    runner.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });
    runner.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });
    runner.on("close", code => {
        console.log(`child process exited with code ${code}`);
    });
}

async function startCreation(userUuid, projectId, nftCollectionId) {
    try {
        let user = await findUserByUUid(userUuid);
        let project = await Project.findById(projectId).exec();
        let blockchain = await Blockchain.findById(project.blockchain).exec();
        let layers = await findLayersByNftCollectionId(nftCollectionId);
        // order layers by position
        layers = layers.sort((a, b) => (a.position > b.position) ? 1 : -1);
        let nftCollection = await NftCollection.findById(nftCollectionId).exec();

        let creators = await findCreatorsByNftCollectionId(nftCollectionId);
        let creatorsForMetadata = creators.map(creator => {
            return {
                address: creator['walletAddress'],
                share: creator['percent'],
            }
        });
        let layerConfigurations = {
            growEditionSizeTo: project.numberToGenerate,
            layersOrdered: layers.map(layer => {
                return {
                    name: layer.name
                }
            })
        };
        createPrincipalsScripts(userUuid, blockchain, nftCollection, creatorsForMetadata, layerConfigurations);
        createUtilsFolder(userUuid);

        // execute the runner.js file inside the user folder in publicLayersPath
        let runner = spawn('node', [`${publicLayersPath}/${userUuid}/runner.js`]);

        runner.stdout.on("data", data => {
            let index = null;
            let newImagePath = null;
            let newMetadataPath = null;
            if (data.includes('index')) index = parseInt(data.toString().split('index')[1]);
            if (data.includes('newImagePath')) newImagePath = data.toString().split('newImagePath')[1];
            if (data.includes('newMetadataPath')) newMetadataPath = data.toString().split('newMetadataPath')[1];
        });

        runner.stderr.on("data", data => {
            console.log(`stderr: ${data}`);
        });

        runner.on('error', (error) => {
            console.log(`error: ${error.message}`);
        });

        runner.on("close", code => {
            console.log(`child process exited with code ${code}`);
            createNfts(userUuid, nftCollectionId);
            createPreviewGifImage(userUuid);
        });

        return {
            success: true,
            message: "All good",
            data: {
                basePath: basePath
            }
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Server error",
        };
    }
}

async function findCreatorsByNftCollectionId(nftCollectionId) {
    return await SplitRoyalty.find({nftCollection: nftCollectionId}).exec();
}

const seeCreationConfirmed = async (req, res = response) => {
    try {
        const reactFrontendApp = basePath + '/frontend';
        res.sendFile(`${reactFrontendApp}/build/index.html`);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

const updateNftImageInView = async (req, res = response) => {
    try {
        // get all images from user build folder
        const userUuid = req.body.userUuid;
        const path = `${publicLayersPath}/${userUuid}/build/images`;
        const pathForWeb = `/layers/${userUuid}/build/images`;
        const images = 0;
        // check if file exists
        if (fs.existsSync(`${path}/1.png`) && !fs.existsSync(`${path}/2.png`) && !fs.existsSync(`${path}/3.png`)) {
            return res.json({
                    imagePaths: [
                        `${pathForWeb}/1.png`,
                    ],
                },
            )
        }
        if (fs.existsSync(`${path}/1.png`) && fs.existsSync(`${path}/2.png`) && !fs.existsSync(`${path}/3.png`)) {
            return res.json({
                    imagePaths: [
                        `${pathForWeb}/1.png`,
                        `${pathForWeb}/2.png`,
                    ],
                },
            )
        }
        if (fs.existsSync(`${path}/1.png`) && fs.existsSync(`${path}/2.png`) && fs.existsSync(`${path}/3.png`)) {
            return res.json({
                    imagePaths: [
                        `${pathForWeb}/1.png`,
                        `${pathForWeb}/2.png`,
                        `${pathForWeb}/3.png`,
                    ],
                },
            )
        }
        res.json({
            imagePaths: []
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

const test = async (req, res = response) => {
    try {
        const reactFrontendApp = basePath + '/frontend';
        res.sendFile(`${reactFrontendApp}/build/index.html`);
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
    saveFifthStep,
    seeCreationConfirmed,
    updateNftImageInView,
    test
};