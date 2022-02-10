const { Schema, model } = require("mongoose");

const ProjectSchema = new Schema({
    blockchain: {
        type: Schema.Types.ObjectId,
        ref: "Blockchain",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        require: true,
    },
    numberToGenerate: {
        type: Number,
        require: true,
    },
    layersFolderPath: {
        type: String,
        require: true,
    },
}, {
    timestamps: true,
});

ProjectSchema.method("toJSON", function () {
    const { __v, ...obj } = this.toObject();
    return obj;
});

module.exports = model("Project", ProjectSchema);