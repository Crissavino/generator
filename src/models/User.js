const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
    uuid: {
        type: String,
        required: true,
        unique: true,
        default: false,
    },
    name: {
        type: String,
        require: false,
    },
    lastName: {
        type: String,
        require: false,
    },
    email: {
        type: String,
        require: false,
        unique: true,
    },
    password: {
        type: String,
        require: false,
    },
}, {
    timestamps: true,
});

UserSchema.method("toJSON", function () {
    const { __v, password, ...obj } = this.toObject();
    return obj;
});

module.exports = model("User", UserSchema);