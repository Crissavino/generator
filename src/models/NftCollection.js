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
}, {
    timestamps: true,
});

NftCollectionSchema.method("toJSON", function () {
    const { __v, ...obj } = this.toObject();
    return obj;
});

module.exports = model("NftCollection", NftCollectionSchema);