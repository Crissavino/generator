const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
    uuid: {
        type: String,
        required: true,
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
    },
    password: {
        type: String,
        require: false,
    },
    nonce: {
        type: Number,
        require: false,
        default: Math.floor(Math.random() * 1000000),
    },
    publicAddress: {
        type: String,
        require: false,
    },
    address: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    projects: [
        {
            type: Schema.Types.ObjectId,
            ref: "Project",
        },
    ],
}, {
    timestamps: true,
});

UserSchema.method("toJSON", function () {
    const { __v, password, ...obj } = this.toObject();
    return obj;
});

module.exports = model("User", UserSchema);