const {Schema, model} = require("mongoose");

const WhiteListSchema = new Schema({
    addresses: {
        type: [String],
        required: true
    }
}, {
    timestamps: true,
});

WhiteListSchema.method("toJSON", function () {
    const {__v, ...obj} = this.toObject();
    return obj;
});

module.exports = model("WhiteList", WhiteListSchema);