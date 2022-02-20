const { response } = require("express");
const { create, globSource } = require("ipfs-http-client");
const fs = require("fs");
const User = require('../../models/User');
const Nft = require('../../models/Nft');
const NftCollection = require("../../models/NftCollection");
const basePath = process.cwd();
const publicLayersPath = basePath + '/public/layers';


async function ipfsClient() {
    const ipfs = await create(
        {
            host: "ipfs.infura.io",
            port: 5001,
            protocol: "https"
        }
    );
    return ipfs;
}

async function saveNftMetadata(ipfs, nft) {
    let options = {
        warpWithDirectory: true,
        progress: (prog) => console.log(`Saved :${prog}`)
    }
    let result = await ipfs.add(nft.metadata, options);
    if (result) {
        console.log(result.path);
        nft.ipfsMetadataHash = result.path;
        nft.save();
    }
}

async function saveNftCollectionMetadata(ipfs, nftCollection) {
    let options = {
        warpWithDirectory: true,
        progress: (prog) => console.log(`Saved :${prog}`)
    }
    let result = await ipfs.add(nftCollection.metadata, options);
    if (result) {
        console.log(result.path);
        nftCollection.ipfsMetadataHash = result.path;
        nftCollection.save();
    }
}
// saveText();

async function saveNftImage(ipfs, nft) {
    let data = fs.readFileSync(nft.imagePath)
    let options = {
        warpWithDirectory: true,
        progress: (prog) => console.log(`Saved :${prog}`)
    }
    let result = await ipfs.add(data, options);
    if (result) {
        console.log(result.path);
        nft.ipfsImageHash = result.path;
        nft.save();
    }
}
// saveFile()

async function getData(hash) {
    let ipfs = await ipfsClient();

    let asyncItr = ipfs.cat(hash)

    for await (const itr of asyncItr) {

        let dataS = Buffer.from(itr).toString()
        console.log(dataS)
        let dataJ = Buffer.from(itr).toJSON()
        console.log(dataJ)
        console.log(dataJ.data)
    }
}
// getData('QmNbgVii5zsywA5xLreA8KuC8Y8twmoXR9d2z74jEaDSyg')

const uploadOneNft = async (req, res = response) => {
    const nftId = req.body.nftId;
    try {
        let ipfs = await ipfsClient();
        let nft = await Nft.findById(nftId).exec();
        await saveNftMetadata(ipfs, nft);
        await saveNftImage(ipfs, nft);
        return res.json({
            success: true,
            message: 'Nft uploaded successfully'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

async function uploadCollectionMetadataToIpfs(nftCollectionId) {
    try {
        let ipfs = await ipfsClient();
        let nftCollection = await NftCollection.findById(nftCollectionId).exec();
        await saveNftCollectionMetadata(ipfs, nftCollection);
        return {
            success: true,
            message: 'Collection metadata uploaded successfully'
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Server error",
        }
    }
}

async function updateJsonFiles(ipfsImagesFolderHash, nftCollection, nfts) {
    try {
        for (const nftsKey in nfts) {
            if (nfts.hasOwnProperty(nftsKey)) {
                const nft = nfts[nftsKey];
                // replace NFT_COLLECTION_IPFS_BASE_URI with ipfsImagesFolderHash
                let metadataNftFile = fs.readFileSync(`${nft.metadataPath}`, 'utf8');
                metadataNftFile = metadataNftFile.replace("NFT_COLLECTION_IPFS_BASE_URI", `ipfs://${ipfsImagesFolderHash}`);
                fs.writeFileSync(`${nft.metadataPath}`, metadataNftFile);
                // update nft metadata attribute
                nft.metadata = fs.readFileSync(`${nft.metadataPath}`, 'utf8');
                await nft.save();
            }
        }
        // nfts.forEach( nft => {
        //     // let nftFileName = nft.metadataPath.split('/').pop();
        //     // replace NFT_COLLECTION_IPFS_BASE_URI with ipfsImagesFolderHash
        //     let metadataNftFile = fs.readFileSync(`${nft.metadataPath}`, 'utf8');
        //     metadataNftFile = metadataNftFile.replace("NFT_COLLECTION_IPFS_BASE_URI", `ipfs://${ipfsImagesFolderHash}`);
        //     fs.writeFileSync(`${nft.metadataPath}`, metadataNftFile);
        //     // update nft metadata attribute
        //     nft.metadata = fs.readFileSync(`${nft.metadataPath}`, 'utf8');
        //     nft.save();
        // })

        let nftCollectionFile = fs.readFileSync(`${nftCollection.metadataPath}`, 'utf8');
        nftCollectionFile = nftCollectionFile.replaceAll("NFT_COLLECTION_IPFS_BASE_URI", `ipfs://${ipfsImagesFolderHash}`);
        fs.writeFileSync(`${nftCollection.metadataPath}`, nftCollectionFile);

        // update nftCollection metadata attribute
        nftCollection.metadata = fs.readFileSync(`${nftCollection.metadataPath}`, 'utf8');
        nftCollection.save();

        return {
            success: true,
            message: 'Json files updated successfully'
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Server error",
        }
    }
}

async function saveAllCollectionImages(ipfs, imageFolderPath, nftCollection, nfts) {
    //options specific to globSource
    const globSourceOptions = {
        recursive: true
    };

    //example options to pass to IPFS
    const addOptions = {
        pin: true,
        wrapWithDirectory: true,
        timeout: 10000,
        progress: (prog) => console.log(`received: ${prog}`)
    };

    console.log('=============== Uploading collection images to IPFS ===============');
    for await (const file of ipfs.addAll(globSource(`${imageFolderPath}`, '**/*', globSourceOptions), addOptions)) {
        // check if is the last file
        if (file.path === '') {
            console.log(file.cid.toString()) // Qmd8hGASptLJHuLnAq24qXqt2MEHL9TgAHQw8FJwcgEDD5
            console.log(file.path)
            console.log(file.size)
            //update the collection with the CID
            const ipfsImagesFolderHash = file.cid.toString();
            nftCollection.ipfsImagesFolderHash = ipfsImagesFolderHash;
            nftCollection.save();

            await updateJsonFiles(ipfsImagesFolderHash, nftCollection, nfts);

        } else {
            // find Nft where name is equal to file.path and save the CID
            let nft = nfts.find(nft => {
                let nftFileName = nft.imagePath.split('/').pop();
                return nftFileName === file.path
            });
            if (nft) {
                nft.ipfsImageHash = file.cid.toString();
                nft.save();
                console.log(file.cid.toString())
                console.log(file.path)
                console.log(file.size)
            } else {
                console.log('nft not found')
            }

        }
    }
    console.log('=============== Uploading collection images to IPFS ===============');
}

async function saveAllCollectionMetadata(ipfs, metadataFolderPath, nftCollection, nfts) {
    //options specific to globSource
    const globSourceOptions = {
        recursive: true
    };

    //example options to pass to IPFS
    const addOptions = {
        pin: true,
        wrapWithDirectory: true,
        timeout: 10000,
        progress: (prog) => console.log(`received: ${prog}`)
    };

    console.log('=============== Uploading collection metadata to IPFS ===============');
    for await (const file of ipfs.addAll(globSource(`${metadataFolderPath}`, '**/*', globSourceOptions), addOptions)) {
        // check if is the last file
        if (file.path === '') {
            console.log(file.cid.toString()) // Qmd8hGASptLJHuLnAq24qXqt2MEHL9TgAHQw8FJwcgEDD5
            console.log(file.path)
            console.log(file.size)
            //update the collection with the CID
            nftCollection.ipfsMetadataFolderHash = file.cid.toString();
            nftCollection.save();
        } else {
            // find Nft where name is equal to file.path and save the CID
            let nft = nfts.find(nft => {
                let nftFileName = nft.metadataPath.split('/').pop();
                return nftFileName === file.path
            });
            if (nft) {
                nft.ipfsMetadataHash = file.cid.toString();
                nft.save();
                console.log(file.cid.toString())
                console.log(file.path)
                console.log(file.size)
            } else {
                console.log('nft not found')
            }

        }
    }
    console.log('=============== Uploading collection metadata to IPFS ===============');
}

async function uploadImageFolderToIpfs(userUuid, nftCollectionId) {
    try {
        let ipfs = await ipfsClient();
        // get nftCollection and populate with project
        // let nftCollection = await NftCollection.findById(nftCollectionId).exec();
        let imageFolderPath = `${publicLayersPath}/${userUuid}/build/images`
        let metadataFolderPath = `${publicLayersPath}/${userUuid}/build/json`

        await saveAllCollectionImages(ipfs, imageFolderPath);
        return {
            success: true,
            message: 'Collection metadata uploaded successfully'
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Server error",
        }
    }
}

async function uploadEntireCollectionToIpfs(userUuid, nftCollectionId) {
    try {
        let ipfs = await ipfsClient();
        // get nftCollection and populate with project
        let nftCollection = await NftCollection.findById(nftCollectionId).exec();
        // get all Nfts related with this nftCollectionId
        let nfts = await Nft.find({ nftCollection: nftCollectionId }).exec();

        let imageFolderPath = `${publicLayersPath}/${userUuid}/build/images`
        let metadataFolderPath = `${publicLayersPath}/${userUuid}/build/json`

        await saveAllCollectionImages(ipfs, imageFolderPath, nftCollection, nfts);
        await saveAllCollectionMetadata(ipfs, metadataFolderPath, nftCollection, nfts);
        return {
            success: true,
            message: 'Collection metadata uploaded successfully'
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Server error",
        }
    }
}

module.exports = {
    saveFile: saveNftImage,
    uploadOneNft,
    uploadCollectionMetadataToIpfs,
    updateJsonFiles,
    uploadEntireCollectionToIpfs
};