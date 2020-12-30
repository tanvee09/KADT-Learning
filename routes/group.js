/*const express = require('express');
const router = express.Router();
const Groups = require('../models/groups');

app.get('/group/new', (req, res) => {
    if (req.user)
        res.render('group_form', {error : 'none'});
    else
        res.redirect('login');
})


app.get('/group/join', (req, res) => {
    if (req.user)
        res.render('group_form', { error: 'none' });
    else
        res.redirect('login');
})

app.post('/group/new', (req, res) => {
    Groups.findOne({ name: req.body.groupname }).then(result => {
        if (result!= null)
        {
            console.log(result);
            res.render('group_form', { error: "This group name already exists. Choose a different name." })
        }
        else {
            Groups.insertOne({
                name: req.body.groupname,
                users: [req.user._id]
            }).then((result) =>
                res.redirect(`chat/group/${result._id}`));
        }
    })
})


app.post('/group/join', (req, res) => {
    Groups.findOne({ name: req.body.groupname }).then(result => {
        if (result!=null) {
            Group.updateOne({ name: req.body.name }, { $push: { users: req.user._id } });
            res.redirect(`/chat/group/${result._id}`);
        }
        else {
            res.render('group_form', { error: "This group name does not exist" });
        }
    })
})

module.exports = router;*/