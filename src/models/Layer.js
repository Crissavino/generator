const { Schema, model } = require("mongoose");
const CollectionSchema = require("./Collection");

const LayerSchema = new Schema({
    collection: CollectionSchema,
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
}, {
    timestamps: true,
});

LayerSchema.method("toJSON", function () {
    const { __v, ...obj } = this.toObject();
    return obj;
});

module.exports = model("Layer", LayerSchema);