const mongoose = require('mongoose');
const { User } = require("./userModel.js")
const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true,
    },
    msg: {
        type: String,
        required: true
    },
    chat_id: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('Messages', MessageSchema);