const mongoose = require('mongoose');
const { User } = require('./userModel.js');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    users: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: User }],
        unique: false 
    }
})

const Group = new mongoose.model("Group", groupSchema);

module.exports = Group;