const { Schema, model } = require("mongoose");
const UserSchema = require("./User");
const Blockchain = require("./Blockchain");

const BlockchainSchema = new Schema({
    name: {
        type: String,
        require: true,
    },
}, {
    timestamps: true,
});

BlockchainSchema.method("toJSON", function () {
    const { __v, ...obj } = this.toObject();
    return obj;
});

module.exports = model("Blockchain", BlockchainSchema);