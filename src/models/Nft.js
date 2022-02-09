const {Schema, model} = require("mongoose");
const CollectionSchema = require("./Collection");

const NftSchema = new Schema({
    collection: CollectionSchema,
    name: {
        type: String,
        require: true,
    },
    metadata: {
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