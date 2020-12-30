/*const express = require('express');
const router = express.Router();
const Groups = require('../models/groups');
const { User } = require('../models/userModel');
const Messages = require('../models/Message');

app.get("/chat/:type/:id", function (req, res) {
    console.log("chats");
    data = {
        'id':"5feaf88cf128835a6010f20c", 'type': req.params.type, 'chat_id': req.params.id };
    User.findById({ "_id": data.id }, '_id name', function (err, result) {
        if (err) { res.status(500).send("internal server error") }
        else {
            console.log(result);
            User.find({}, '_id name online', function (err, users) {
                if (err)
                    res.status(500).send("Internal server error");
                else {
                    if (data.type == "group")
                        chat_id = data.chat_id;
                    else
                        var chat_id = (data.id > data.chat_id ? data.chat_id + data.id : data.id + data.chat_id);
                    Groups.find({ users: result }).then((groups) => {
                            Messages.find({ chat_id }).lean().exec(
                                function (err, msgs) {
                                    if (err) { res.status(500).send("Internal Server error"); }
                                    else {
                                        var chatname ,access ,members;
                                        async function addinfo() {
                                            msgs = await Promise.all(msgs.map(async (msg) => {
                                                await User.findById(msg.sender).then(friend => { msg["sendername"] = friend.name; })
                                                    .catch(err => { res.status(500).send("Internal Server error") })
                                                return msg
                                            })
                                            )
                                        }
                                        async function addmembers(members) {
                                            members = await Promise.all(members.map(async (member) => {
                                                await User.findById(member).then(friend => { member["name"] = friend.name })
                                                    .catch(err => { res.status(500).send("Internal Server error") })
                                                return member;
                                            }))
                                        }
                                        async function addname() {
                                            if (data.type == "group") {
                                                await Groups.findById({ _id: data.chat_id }).then(async (group) => {
                                                    if (group != null) {
                                                        chatname = group.name;
                                                        if (group.users.map(user => user.toString()).includes(result._id.toString())) {
                                                            access = true;
                                                            await addmembers();
                                                        }
                                                        else
                                                            access = false;
                                                    }
                                                })
                                            }
                                            else {
                                                await User.findById(data.chat_id).then(friend => {
                                                    if (friend == null)
                                                        access = false;
                                                    else {
                                                        access = true;
                                                        chatname = friend.name;
                                                    }
                                                })
                                            }
                                        }
                                        addinfo().then(() => {
                                            addname().then(() => {
                                                res.render('chats.ejs', { users, receiver: result, msgs, chatname, chat_id: chat_id, groups ,access:access});
                                            })
                                        }).catch(err => { res.status(500).send("internal server error") })
                                    }
                                }
                            )
                    })
                }
            })
        }
    })
}
)

module.exports = router;*/