const {Schema, model} = require("mongoose");

const SmartContractSchema = new Schema({
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    configFilePath: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    deployed: {
        type: Boolean,
        default: false
    },
    verified: {
        type: Boolean,
        default: false
    },
    whiteList: {
        type: Schema.Types.ObjectId,
        ref: "WhiteList",
        required: true
    },
}, {
    timestamps: true,
});

SmartContractSchema.method("toJSON", function () {
    const {__v, ...obj} = this.toObject();
    return obj;
});

module.exports = model("SmartContract", SmartContractSchema);