const { Schema, model } = require("mongoose");

const LayerSchema = new Schema({
    nftCollection: {
        type: Schema.Types.ObjectId,
        ref: "NftCollection",
        required: true
    },
    name: {
        type: String,
        require: true,
    },
    path: {
        type: String,
        require: true,
    },
    variantsNumber: {
        type: Number,
        require: true,
    },
    position: {
        type: Number,
        require: true,
    },
    variants: [{
        type: Schema.Types.ObjectId,
        ref: "Variant",
    }],
}, {
    timestamps: true,
});

LayerSchema.method("toJSON", function () {
    const { __v, ...obj } = this.toObject();
    return obj;
});

module.exports = model("Layer", LayerSchema);