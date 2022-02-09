const { Schema, model } = require("mongoose");
const CollectionSchema = require("./Collection");

const SplitRoyaltySchema = new Schema({
    collection: CollectionSchema,
    walletAddress: {
        type: String,
        require: true,
    },
    percentage: {
        type: Number,
        require: true,
    },
}, {
    timestamps: true,
});

SplitRoyaltySchema.method("toJSON", function () {
    const { __v, ...obj } = this.toObject();
    return obj;
});

module.exports = model("SplitRoyalty", SplitRoyaltySchema);