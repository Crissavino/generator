const { response } = require("express");
const pool = require("../database");
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
        session.totalNFTToGenerate = imagesToGenerate;
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
    console.log(layersOrdered)
    console.log('entra aca')
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
    let userUuid = session.userUuid;
    if (!userUuid) {
        return res.redirect('/nft-creation/first-step')
    }
    const mainFolderName = fs.readdirSync(`public/layers/${userUuid}`);
    // TODO get layers ordered from last step
    let layers = getUserUploadedFolder(userUuid, mainFolderName);
    console.log(layers)
    try {
        res.render("nft_creation_step_5", {
            pageTitle: "Fifth Step",
            mainFolderName,
            layers,
            saveFifthStepUrl: '/nft-creation/save-fifth-step',
            previousStepUrl: '/nft-creation/fourth-step',
            totalNFTToGenerate: 10000
            // totalNFTToGenerate: session.totalNFTToGenerate
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
};