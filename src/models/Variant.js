const { Schema, model } = require("mongoose");

const VariantSchema = new Schema({
    layer: {
        type: Schema.Types.ObjectId,
        ref: "Layer",
        required: true
    },
    name: {
        type: String,
        require: true,
    },
    fileName: {
        type: String,
        require: true,
    },
    filePath: {
        type: String,
        require: true,
    },
    variantNumber: {
        type: Number,
        require: true,
    },
}, {
    timestamps: true,
});

VariantSchema.method("toJSON", function () {
    const { __v, ...obj } = this.toObject();
    return obj;
});

module.exports = model("Variant", VariantSchema);