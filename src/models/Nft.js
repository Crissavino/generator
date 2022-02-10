const {Schema, model} = require("mongoose");

const NftSchema = new Schema({
    collection: {
        type: Schema.Types.ObjectId,
        ref: "Collection",
        required: true
    },
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