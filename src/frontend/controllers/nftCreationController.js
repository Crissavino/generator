const { response } = require("express");
const fs = require('fs')
const multer = require("multer");

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

        fs.mkdirSync(`public/layers/${userUuid}`, { recursive: true });
        fs.chmodSync(`public/layers/${userUuid}`, 0o777);
        fs.mkdirSync(`public/layers/${userUuid}/${folderStructure}`, { recursive: true });
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

        fs.mkdirSync(`public/layers/${userUuid}`, { recursive: true });
        fs.chmodSync(`public/layers/${userUuid}`, 0o777);
        fs.mkdirSync(`public/layers/${userUuid}/${folderStructure}`, { recursive: true });
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

function fileFilter (req, file, cb) {
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
    const body = req.body;
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

const postLayersFolder = async (req, res = response) => {
    try {
        uploadLayersFolder(req, res, function (err) {
            if (err) {
                console.log(err)
                res.status(500).json({
                    success: false,
                    message: "File type not allowed",
                });
            }

            let session = req.session;
            session.userUuid = req.body.userUuid;

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
    const body = req.body;
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
            fs.rmdirSync(`public/layers/${userUuid}/${folder}`, { recursive: true });
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
                message: "All files updated",
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

const saveSecondStep = async (req, res = response) => {
    try {
        const { imagesToGenerate } = req.body;
        let session = req.session;
        // TODO recover from database
        session.totalNFTToGenerate = imagesToGenerate ?? 1000;
        let userUuid = session.userUuid;
        const mainFolderName = fs.readdirSync(`public/layers/${userUuid}`);
        let layers = getUserUploadedFolder(userUuid, mainFolderName);
        // TODO save data in DB
        res.redirect(`/nft-creation/third-step`)
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }

}

const seeThirdStep = async (req, res = response) => {
    const body = req.body;
    let session = req.session;
    let userUuid = session.userUuid;
    if (!userUuid) {
        return res.redirect('/nft-creation/first-step')
    }
    const mainFolderName = fs.readdirSync(`public/layers/${userUuid}`);
    let layers = getUserUploadedFolder(userUuid, mainFolderName);
    try {
        res.render("nft_creation_step_3", {
            pageTitle: "Fourth Step",
            mainFolderName,
            layers,
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

const saveThirdStep = async (req, res = response) => {
    const body = req.body;
    let session = req.session;
    let userUuid = session.userUuid;
    const mainFolderName = fs.readdirSync(`public/layers/${userUuid}`);
    let layers = getUserUploadedFolder(userUuid, mainFolderName);
    try {
        // TODO save data in DB
        res.redirect(`/nft-creation/fourth-step`)
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }

}

const seeFourthStep = async (req, res = response) => {
    const body = req.body;
    let session = req.session;
    let userUuid = session.userUuid;
    if (!userUuid) {
        return res.redirect('/nft-creation/first-step')
    }
    const mainFolderName = fs.readdirSync(`public/layers/${userUuid}`);
    let layers = getUserUploadedFolder(userUuid, mainFolderName);
    try {
        res.render("nft_creation_step_4", {
            pageTitle: "Fourth Step",
            mainFolderName,
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
    const { layersOrdered } = req.body;
    let session = req.session;
    let userUuid = session.userUuid;
    const mainFolderName = fs.readdirSync(`public/layers/${userUuid}`);
    let oldLayers = getUserUploadedFolder(userUuid, mainFolderName);
    session.layersOrdered = layersOrdered;
    try {
        // TODO save data in DB
        res.redirect(`/nft-creation/fifth-step`)
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }

}

const seeFifthStep = async (req, res = response) => {
    const body = req.body;
    let session = req.session;
    let userUuid = session.userUuid ?? '06k6c';
    if (!userUuid) {
        return res.redirect('/nft-creation/first-step')
    }

    let layers = session.layersOrdered ? JSON.parse(session.layersOrdered) : [
        {
            "index": 0,
            "name": "Top lid",
            "filesInside": 3,
            "files": [
                {
                    "completeName": "High#30.png",
                    "name": "High#30",
                    "url": "/layers/al5h7/layers/Top lid/High#30.png"
                },
                {
                    "completeName": "Low#20.png",
                    "name": "Low#20",
                    "url": "/layers/al5h7/layers/Top lid/Low#20.png"
                },
                {
                    "completeName": "Middle#50.png",
                    "name": "Middle#50",
                    "url": "/layers/al5h7/layers/Top lid/Middle#50.png"
                }
            ],
            "sortableIndex": "9or"
        },
        {
            "index": 1,
            "name": "Bottom lid",
            "filesInside": 3,
            "files": [
                {
                    "completeName": "High#20.png",
                    "name": "High#20",
                    "url": "/layers/al5h7/layers/Bottom lid/High#20.png"
                },
                {
                    "completeName": "Low#40.png",
                    "name": "Low#40",
                    "url": "/layers/al5h7/layers/Bottom lid/Low#40.png"
                },
                {
                    "completeName": "Middle#40.png",
                    "name": "Middle#40",
                    "url": "/layers/al5h7/layers/Bottom lid/Middle#40.png"
                }
            ],
            "sortableIndex": "9xj"
        },
        {
            "index": 2,
            "name": "Eye color",
            "filesInside": 6,
            "files": [
                {
                    "completeName": "Cyan#1.png",
                    "name": "Cyan#1",
                    "url": "/layers/al5h7/layers/Eye color/Cyan#1.png"
                },
                {
                    "completeName": "Green#1.png",
                    "name": "Green#1",
                    "url": "/layers/al5h7/layers/Eye color/Green#1.png"
                },
                {
                    "completeName": "Pink#1.png",
                    "name": "Pink#1",
                    "url": "/layers/al5h7/layers/Eye color/Pink#1.png"
                },
                {
                    "completeName": "Purple#1.png",
                    "name": "Purple#1",
                    "url": "/layers/al5h7/layers/Eye color/Purple#1.png"
                },
                {
                    "completeName": "Red#1.png",
                    "name": "Red#1",
                    "url": "/layers/al5h7/layers/Eye color/Red#1.png"
                },
                {
                    "completeName": "Yellow#10.png",
                    "name": "Yellow#10",
                    "url": "/layers/al5h7/layers/Eye color/Yellow#10.png"
                }
            ],
            "sortableIndex": "9un"
        },
        {
            "index": 3,
            "name": "Goo",
            "filesInside": 1,
            "files": [
                {
                    "completeName": "Green#1.png",
                    "name": "Green#1",
                    "url": "/layers/al5h7/layers/Goo/Green#1.png"
                }
            ],
            "sortableIndex": "9en"
        },
        {
            "index": 4,
            "name": "Iris",
            "filesInside": 3,
            "files": [
                {
                    "completeName": "Large#20.png",
                    "name": "Large#20",
                    "url": "/layers/al5h7/layers/Iris/Large#20.png"
                },
                {
                    "completeName": "Medium#20.png",
                    "name": "Medium#20",
                    "url": "/layers/al5h7/layers/Iris/Medium#20.png"
                },
                {
                    "completeName": "Small#60.png",
                    "name": "Small#60",
                    "url": "/layers/al5h7/layers/Iris/Small#60.png"
                }
            ],
            "sortableIndex": "9hw"
        },
        {
            "index": 5,
            "name": "Eyeball",
            "filesInside": 2,
            "files": [
                {
                    "completeName": "Red#50.png",
                    "name": "Red#50",
                    "url": "/layers/al5h7/layers/Eyeball/Red#50.png"
                },
                {
                    "completeName": "White#50.png",
                    "name": "White#50",
                    "url": "/layers/al5h7/layers/Eyeball/White#50.png"
                }
            ],
            "sortableIndex": "9q0"
        },
        {
            "index": 6,
            "name": "Shine",
            "filesInside": 1,
            "files": [
                {
                    "completeName": "Shapes#100.png",
                    "name": "Shapes#100",
                    "url": "/layers/al5h7/layers/Shine/Shapes#100.png"
                }
            ],
            "sortableIndex": "9kj"
        },
        {
            "index": 7,
            "name": "Background",
            "filesInside": 1,
            "files": [
                {
                    "completeName": "Black#1.png",
                    "name": "Black#1",
                    "url": "/layers/al5h7/layers/Background/Black#1.png"
                }
            ],
            "sortableIndex": "9yu"
        }
    ];
    layers.forEach((layer, i) => {
        layer.index = i;
    });

    try {
        res.render("nft_creation_step_5", {
            pageTitle: "Fifth Step",
            layers,
            saveFifthStepUrl: '/nft-creation/save-fifth-step',
            previousStepUrl: '/nft-creation/fourth-step',
            // totalNFTToGenerate: 10000
            totalNFTToGenerate: session.totalNFTToGenerate ?? 1000
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
    let { layersWithVariants } = req.body;
    let session = req.session;
    let userUuid = session.userUuid ?? '06k6c';
    if (!userUuid) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            redirectTo: '/nft-creation/first-step'
        });
    }

    try {
        layersWithVariants = JSON.parse(layersWithVariants);
        const mainFolderName = fs.readdirSync(`public/layers/${userUuid}`);
        layersWithVariants.map(layer => {
            fs.readdirSync(`public/layers/${userUuid}/${mainFolderName}`).forEach((folder, index) => {
                if (folder === layer.layerName) {
                    fs.readdirSync(`public/layers/${userUuid}/${mainFolderName}/${folder}`).map(file => {
                        let fileExtension = file.split('.')[1];
                        fs.renameSync(
                            `public/layers/${userUuid}/${mainFolderName}/${folder}/${file}`,
                            `public/layers/${userUuid}/${mainFolderName}/${folder}/${layer.traitWithRarity}.${fileExtension}`
                        );
                    })
                }
            });
        });

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