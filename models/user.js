const mongoose = require('mongoose');
const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: {
        type: String,
        required: [true, "username is required"],
        unique: true
    }, 
    password: {
        type: String,
        required: true
    }
})

const UserModel = mongoose.model("user", UserSchema)
module.exports = UserModel