const { Schema, model } = require("mongoose");
const ProjectSchema = require("./Project");

const CollectionSchema = new Schema({
    project: ProjectSchema,
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
        require: true,
    },
    royaltiesForSecondarySales: {
        type: Number,
        require: true,
    },
}, {
    timestamps: true,
});

CollectionSchema.method("toJSON", function () {
    const { __v, ...obj } = this.toObject();
    return obj;
});

module.exports = model("Collection", CollectionSchema);