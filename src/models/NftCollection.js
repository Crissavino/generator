const { Schema, model } = require("mongoose");

const NftCollectionSchema = new Schema({
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    name: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    imagesName: {
        type: String,
        require: true,
    },
    family: {
        type: String,
        require: true,
    },
    symbol: {
        type: String,
        require: true,
    },
    externalUrl: {
        type: String,
        require: false,
        default: null
    },
    royaltiesForSecondarySales: {
        type: Number,
        require: true,
    },
    metadata: {
        type: String,
        require: true,
    },
    metadataPath: {
        type: String,
        require: true,
    },
    metadataRelativePath: {
        type: String,
        require: true,
    },
    ipfsImagesFolderHash: {
        type: String,
        require: true,
    },
    ipfsMetadataFolderHash: {
        type: String,
        require: true,
    },
    layers: [{
        type: Schema.Types.ObjectId,
        ref: "Layer",
    }],
    splitRoyalties: [
        {
            type: Schema.Types.ObjectId,
            ref: "SplitRoyalties",
        }
    ],
}, {
    timestamps: true,
});

NftCollectionSchema.method("toJSON", function () {
    const { __v, ...obj } = this.toObject();
    return obj;
});

module.exports = model("NftCollection", NftCollectionSchema);