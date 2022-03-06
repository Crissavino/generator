const { response } = require("express");
const User = require('../../models/User');
const NftCollection = require('../../models/NftCollection');
const Nft = require('../../models/Nft');
const Project = require('../../models/Project');
const SmartContract = require('../../models/SmartContract');
const WhiteList = require('../../models/WhiteList');
const fs = require("fs");
const {spawn} = require("child_process");
const basePath = process.cwd();

const seeUserArea = async (req, res = response) => {
    const userUuid = req.params.userUuid ?? '309oet';

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

const seeSmartContractCreate = async (req, res = response) => {
    const projectId = req.query.projectId;
    const userUuid = req.query.userUuid;
    try {
        res.render(
            "user_smart_contract_create",
            {
                projectId,
                userUuid,
                saveSmartContractUrl: '/user/smart-contract/save',
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

async function createContractName() {
    // get all smart contracts
    const smartContracts = await SmartContract.find({}).lean();
    // get all smart contracts names
    const smartContractNames = smartContracts.map(smartContract => smartContract.name);
    // create a random letters name for smart contract
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    let name = 'NFTContractCMS';
    for (let i = 0; i < 6; i++) {
        name += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    // if name already exists, create a new one
    if (smartContractNames.includes(name)) {
        await createContractName();
    } else {
        return name;
    }

}

function editConfigFiles(contractName, userUuid, project, configParameters, wallets, smartContractProjectFolderPath) {
    const smartContractUserConfigFolderPath = `${smartContractProjectFolderPath}/config/${userUuid}`;

    let collectionConfigFile = fs.readFileSync(`${smartContractUserConfigFolderPath}/CollectionConfig.ts`, 'utf8');
    collectionConfigFile = collectionConfigFile.replace("USER_UUID", userUuid);
    collectionConfigFile = collectionConfigFile.replace("TOKEN_NAME", project.nftCollections[0].name);
    collectionConfigFile = collectionConfigFile.replace("TOKEN_SYMBOL", project.nftCollections[0].symbol);
    collectionConfigFile = collectionConfigFile.replace("MAX_SUPPLY", project.numberToGenerate);
    collectionConfigFile = collectionConfigFile.replace("WHITE_LIST_PRICE", configParameters.whiteListPrice);
    collectionConfigFile = collectionConfigFile.replace("WHITE_LIST_MAX_MINT", configParameters.whiteListMaxMint);
    collectionConfigFile = collectionConfigFile.replace("PRE_SALE_PRICE", configParameters.preSalePrice);
    collectionConfigFile = collectionConfigFile.replace("PRE_SALE_MAX_MINT", configParameters.preSaleMaxMint);
    collectionConfigFile = collectionConfigFile.replace("PUBLIC_PRICE", configParameters.preSalePrice);
    collectionConfigFile = collectionConfigFile.replace("PUBLIC_MAX_MINT", configParameters.publicSaleMaxMint);
    // create an open sea slug from token name
    const slug = project.nftCollections[0].name.toLowerCase().replace(/ /g, '-');
    collectionConfigFile = collectionConfigFile.replace("TOKEN_NAME_SLUG", slug);
    fs.writeFileSync(`${smartContractUserConfigFolderPath}/CollectionConfig.ts`, collectionConfigFile);

    //create a file with the array of wallets addresses
    let walletsFile = fs.readFileSync(`${smartContractUserConfigFolderPath}/whitelist.json`, 'utf8');
    walletsFile = walletsFile.replace("WALLETS_ARRAY", JSON.stringify(wallets));
    fs.writeFileSync(`${smartContractUserConfigFolderPath}/whitelist.json`, walletsFile);

    // let envFile = fs.readFileSync(`${smartContractUserConfigFolderPath}/.env`, 'utf8');
    // envFile = envFile.replace("METADATA_IPFS_CID", project.nftCollections[0].ipfsMetadataFolderHash);
    // fs.writeFileSync(`${smartContractUserConfigFolderPath}/.env`, envFile);

    console.log('===========================');
    console.log('editConfigFiles finished');
    console.log(`At ${new Date().toUTCString()}`);
    console.log('===========================');

    return `${smartContractUserConfigFolderPath}/CollectionConfig.ts`;
}

function changeContractName(contractName, userUuid, smartContractProjectFolderPath) {
    // execute spawn command to install hardhat and the yarn rename-contract command
    let runner = spawn('yarn', ['rename-contract', userUuid, contractName], { cwd: smartContractProjectFolderPath });

    runner.stdout.on("data", data => {
        // console.log(data.toString());
    });

    runner.stderr.on("data", data => {
        // console.log(`stderr: ${data}`);
    });

    runner.on('error', (error) => {
        // console.log(`error: ${error.message}`);
    });

    runner.on("close", async (code) => {
        if (code === 0) {
            console.log('===========================');
            console.log('changeContractName finished');
            console.log(`At ${new Date().toUTCString()}`);
            console.log('===========================');
            deployTheContract(userUuid, contractName, 'polygonTest', smartContractProjectFolderPath)
        } else {
            console.log('===========================');
            console.log('changeContractName failed');
            console.log(`At ${new Date().toUTCString()}`);
            console.log('===========================');
        }
    });

}

async function updateSmartContract(query, dataToUpdate) {
    return await SmartContract.findOneAndUpdate(
        query,
        dataToUpdate,
        { new: true })
        .exec();
}

function deployTheContract(userUuid, contractName, network, smartContractProjectFolderPath) {
    const userSmartContractFolderPath = basePath + '/public/smartContracts/' + userUuid;
    const smartContractFolderPath = userSmartContractFolderPath + '/smart-contract';
    // execute spawn command to install hardhat and the yarn rename-contract command
    let runner = spawn('yarn', ['deploy', '--network', network, contractName, userUuid], { cwd: smartContractProjectFolderPath });
    let contractAddress = '';
    runner.stdout.on("data", data => {
        if (data.includes('CONTRACT_ADDRESS')) {
            contractAddress = data.toString().split('CONTRACT_ADDRESS')[1]
            console.log('===========================');
            console.log(`Contract address changed to => ${contractAddress}`);
            console.log(`At ${new Date().toUTCString()}`);
            console.log('===========================');
            // update the smart contract address in the database
            updateSmartContract({name: contractName}, {address: contractAddress}).then(r => console.log('smart contract address updated'));
            let collectionConfigFile = fs.readFileSync(`${smartContractProjectFolderPath}/config/${userUuid}/CollectionConfig.ts`, 'utf8');
            collectionConfigFile = collectionConfigFile.replace("CONTRACT_ADDRESS", contractAddress);
            fs.writeFileSync(`${smartContractProjectFolderPath}/config/${userUuid}/CollectionConfig.ts`, collectionConfigFile);
        }

    });

    runner.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });

    runner.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });

    runner.on("close", async (code) => {
        console.log('===========================');
        console.log(`deployTheContract process exited with code ${code}`);
        console.log(`At ${new Date().toUTCString()}`);
        console.log('===========================');
        if (code === 0) {
            console.log('===========================');
            console.log(`Deployment of smart contract ${contractName} successful`);
            console.log(`At ${new Date().toUTCString()}`);
            console.log('===========================');
            updateSmartContract({name: contractName}, {deployed: true}).then(r => console.log('smart contract deployed'));
            setTimeout(() => {
                console.log('===========================');
                console.log(`verifyTheContact process started`);
                console.log(`At ${new Date().toUTCString()}`);
                console.log('===========================');

                verifyTheContact(userUuid, contractAddress, contractName, smartContractProjectFolderPath)
            } ,60000)
        } else {
            console.log('===========================');
            console.log(`Deployment of smart contract ${contractName} failed`);
            console.log(`At ${new Date().toUTCString()}`);
            console.log('===========================');
        }
    });

    return contractAddress;
}

function verifyTheContact(userUuid, contractAddress, contractName, smartContractProjectFolderPath) {
    // execute spawn command to install hardhat and the yarn rename-contract command
    let runner = spawn('yarn', ['verify', contractAddress,'--network', 'polygonTest', '--contract', `contracts/${userUuid}/${contractName}.sol:${contractName}`], { cwd: smartContractProjectFolderPath });
    runner.stdout.on("data", data => {
        console.log(data.toString());
    });

    runner.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });

    runner.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });

    runner.on("close", async (code) => {
        if (code === 0) {
            console.log('===========================');
            console.log(`Verification of smart contract ${contractName} successful`);
            console.log(`At ${new Date().toUTCString()}`);
            console.log('===========================');
            updateSmartContract({name: contractName}, {verified: true}).then(r => console.log('smart contract verified'));
        } else {
            console.log('===========================');
            console.log(`Verification of smart contract ${contractName} failed`);
            console.log(`At ${new Date().toUTCString()}`);
            console.log('===========================');
        }
    });
}

async function getSmartContractByContractName(contractName) {
    return await SmartContract.findOne({ contractName: contractName }).exec();
}

function createConfigFolder(contractName, userUuid, project, configParameters, wallets, smartContractProjectFolderPath) {
    const smartContractConfigFolderPath = `${smartContractProjectFolderPath}/config`;
    const smartContractUserConfigFolderPath = `${smartContractConfigFolderPath}/${userUuid}`;
    if (!fs.existsSync(smartContractUserConfigFolderPath)) {
        fs.mkdirSync(smartContractUserConfigFolderPath);
    }

    // execute console cp command to copy the project folder and change name with mv
    const smartContractConfigExampleFolderPath = `${smartContractProjectFolderPath}/configExample`;
    let runner = spawn('cp',
        [
            `${smartContractConfigExampleFolderPath}/CollectionConfig.ts`,
            `${smartContractConfigExampleFolderPath}/ContractArguments.ts`,
            `${smartContractConfigExampleFolderPath}/whitelist.json`,
            smartContractUserConfigFolderPath
        ], {cwd: smartContractProjectFolderPath}
    );

    runner.stdout.on("data", data => {
        // console.log(data.toString());
    });

    runner.stderr.on("data", data => {
        // console.log(`stderr: ${data}`);
    });

    runner.on('error', (error) => {
        // console.log(`error: ${error.message}`);
    });

    runner.on("close", async (code) => {
        if (code === 0) {
            console.log('===========================');
            console.log(`createConfigFolder process finished successfully`);
            console.log(`At ${new Date().toUTCString()}`);
            console.log('===========================');
            editConfigFiles(contractName, userUuid, project, configParameters, wallets, smartContractProjectFolderPath)
        } else {
            console.log('===========================');
            console.log(`createConfigFolder process finished with error`);
            console.log(`At ${new Date().toUTCString()}`);
            console.log('===========================');
        }
    });
}

function editLibFiles(userUuid, smartContractProjectFolderPath) {
    const smartContractUserLibFolderPath = `${smartContractProjectFolderPath}/lib/${userUuid}`;

    let nftContractProviderFile = fs.readFileSync(`${smartContractUserLibFolderPath}/NftContractProvider.ts`, 'utf8');
    nftContractProviderFile = nftContractProviderFile.replace("USER_UUID", userUuid);
    fs.writeFileSync(`${smartContractUserLibFolderPath}/NftContractProvider.ts`, nftContractProviderFile);
}

function createLibFolder(userUuid, smartContractProjectFolderPath) {
    const smartContractLibFolderPath = `${smartContractProjectFolderPath}/lib`;
    const smartContractUserLibFolderPath = `${smartContractLibFolderPath}/${userUuid}`;
    if (!fs.existsSync(smartContractUserLibFolderPath)) {
        fs.mkdirSync(smartContractUserLibFolderPath);
    }

    // execute console cp command to copy the project folder and change name with mv
    const smartContractLibExampleFolderPath = `${smartContractProjectFolderPath}/libExample`;
    let runner = spawn('cp',
        [
            `${smartContractLibExampleFolderPath}/CollectionConfigInterface.ts`,
            `${smartContractLibExampleFolderPath}/NftContractProvider.ts`,
            smartContractUserLibFolderPath
        ], {cwd: smartContractProjectFolderPath}
    );

    runner.stdout.on("data", data => {
        // console.log(data.toString());
    });

    runner.stderr.on("data", data => {
        // console.log(`stderr: ${data}`);
    });

    runner.on('error', (error) => {
        // console.log(`error: ${error.message}`);
    });

    runner.on("close", async (code) => {
        if (code === 0) {
            console.log('===========================');
            console.log(`createLibFolder process finished successfully`);
            console.log(`At ${new Date().toUTCString()}`);
            console.log('===========================');
            editLibFiles(userUuid, smartContractProjectFolderPath)
        } else {
            console.log('===========================');
            console.log(`createLibFolder process finished with error`);
            console.log(`At ${new Date().toUTCString()}`);
            console.log('===========================');
        }
    });
}

function copyContract(userUuid, smartContractProjectFolderPath) {
    const smartContractUserContractsFolderPath = `${smartContractProjectFolderPath}/contracts/${userUuid}`;
    const smartContractContractsExampleFolderPath = `${smartContractProjectFolderPath}/contractsExample`;
    if (!fs.existsSync(smartContractUserContractsFolderPath)) {
        fs.mkdirSync(smartContractUserContractsFolderPath);
    }

    // execute console cp command to copy the project folder and change name with mv
    let runner = spawn('cp', [`${smartContractContractsExampleFolderPath}/YourNftToken.sol`, smartContractUserContractsFolderPath], { cwd: smartContractProjectFolderPath });

    runner.stdout.on("data", data => {
        // console.log(data.toString());
    });

    runner.stderr.on("data", data => {
        // console.log(`stderr: ${data}`);
    });

    runner.on('error', (error) => {
        // console.log(`error: ${error.message}`);
    });

    runner.on("close", async (code) => {
        if (code === 0) {
            console.log('===========================');
            console.log(`copyContract process finished successfully`);
            console.log(`At ${new Date().toUTCString()}`);
            console.log('===========================');
        } else {
            console.log('===========================');
            console.log(`copyContract process finished with error`);
            console.log(`At ${new Date().toUTCString()}`);
            console.log('===========================');
        }
    });
}

function startSmartContractCreationOnBlockchain(contractName, userUuid, project, configParameters, wallets) {

    const smartContractProjectFolderPath = `${basePath}/smart-contract-project`;

    copyContract(userUuid, smartContractProjectFolderPath);

    createConfigFolder(contractName, userUuid, project, configParameters, wallets, smartContractProjectFolderPath);

    createLibFolder(userUuid, smartContractProjectFolderPath)

    changeContractName(contractName, userUuid, smartContractProjectFolderPath);
}

const saveSmartContract = async (req, res = response) => {
    const projectId = req.body.projectId;
    const userUuid = req.body.userUuid;
    const wallets = req.body.wallets;
    try {
        const user = await User.findOne({ uuid: userUuid }).exec();
        const project = await Project.findOne({ _id: projectId }).populate({
            path: 'nftCollections',
            populate: {
                path: 'layers',
                populate: {
                    path: 'variants'
                }
            }
        });
        // contract name will be NFTCreator plus random letters with the first letter in uppercase
        const contractName = await createContractName();

        const configParameters = {
            whiteListPrice: req.body.whiteListPrice,
            whiteListMaxMint: req.body.whiteListMaxMintAmount,
            preSalePrice: req.body.preSalePrice,
            preSaleMaxMint: req.body.preSaleMaxMintAmount,
            publicSalePrice: req.body.publicSalePrice,
            publicSaleMaxMint: req.body.publicSaleMaxMintAmount,
        };
        // const configPath = await copySmartContractProjectFolder(contractName, userUuid, project, configParameters, wallets);

        startSmartContractCreationOnBlockchain(contractName, userUuid, project, configParameters, wallets);

        // create the white list
        const whiteList = new WhiteList({
            addresses: wallets,
        });
        await WhiteList.create(whiteList, async (err, whiteList) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Server error",
                });
            }

            // create the smart contract
            const smartContract = new SmartContract({
                project: project._id,
                user: user._id,
                name: contractName,
                configFilePath: `${basePath}/smart-contract-project/config/${userUuid}/CollectionConfig.ts`,
                whiteList: whiteList._id,
            });
            await SmartContract.create(smartContract, (err, smartContract) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: "Server error",
                    });
                }

                // TODO we are creating the smart contract could take a while
                return res.redirect('/user/area');
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

module.exports = {
    seeUserArea,
    seeUserCollection,
    seeSmartContractCreate,
    saveSmartContract,
};