const {Schema, model} = require("mongoose");

const NftSchema = new Schema({
    nftCollection: {
        type: Schema.Types.ObjectId,
        ref: "NftCollection",
        required: true
    },
    name: {
        type: String,
        require: true,
    },
    imagePath: {
        type: String,
        require: true,
    },
    imageRelativePath: {
        type: String,
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
    ipfsImageHash: {
        type: String,
        require: true,
    },
    ipfsMetadataHash: {
        type: String,
        require: true,
    },
}, {
    timestamps: true,
});

NftSchema.method("toJSON", function () {
    const {__v, ...obj} = this.toObject();
    return obj;
});

module.exports = model("Nft", NftSchema);