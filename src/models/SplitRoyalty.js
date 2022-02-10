const { Schema, model } = require("mongoose");

const SplitRoyaltySchema = new Schema({
    nftCollection: {
        type: Schema.Types.ObjectId,
        ref: "NftCollection",
        required: true
    },
    walletAddress: {
        type: String,
        require: true,
    },
    percent: {
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