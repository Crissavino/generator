const { Schema, model } = require("mongoose");
const UserSchema = require("./User");
const Blockchain = require("./Blockchain");

const ProjectSchema = new Schema({
    blockchain: Blockchain,
    user: UserSchema,
    name: {
        type: String,
        require: true,
    },
    numberToGenerate: {
        type: Number,
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