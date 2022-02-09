const { Schema, model } = require("mongoose");
const LayerSchema = require("./Layer");

const VariantSchema = new Schema({
    layer: LayerSchema,
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
    variantPercentage: {
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