require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { v1: uuid } = require('uuid');
const mailgun = require("mailgun-js");

const {User} = require('./models/userModel.js');
const {History} = require('./models/History.js');
const Messages = require('./models/Message.js');

const flash = require("express-flash");

const passport = require("passport");

const Timetable = require('./models/timetableModel');

const productivity = require('./routes/productivity.js');
//const chatRoute = require('./routes/chat.js');
//const groupRoute = require('./routes/group.js');
// const searchengine = require('./routes/searchengine.js');
const Groups = require('./models/groups.js');

app.set("view engine", "ejs");

const initializePassport = require("./passportConfig");

initializePassport(passport);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("static"));


// const searchengine = require('./routes/searchengine.js')(app, express, passport);

app.use('/', productivity);
//app.use('/', groupRoute);
//app.use('/', chatRoute);
// app.use('/', searchengine);

app.use(flash());

app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false
    })
);


app.use(passport.initialize());
app.use(passport.session());


var errors = "none";

dbname = "kadt-learn";
//dbname = "kadtApp"
// url = process.env.DATA_BASE + dbname;
url = 'mongodb://localhost:27017/' + dbname;
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

var http = require('http').createServer(app);
http.listen(3000, function () {
    console.log("listening on port " + 3000);
})

var io = require('socket.io')(http);
var sendSuggestions = "none"

app.get("/", function(req, res) {
    var send = sendSuggestions;
    sendSuggestions = "none";

    if (req.isAuthenticated())
        res.render("index", {authenticated: true, send: send});
    else
        res.render("index", {authenticated: false, send: send});
});

app.post("/suggestion", function(req, res){
    var data = {
        "email": req.body.email,
        "name": req.body.name,
        "suggestion": req.body.suggestion
    }

    if (data.email === "" || data.email === null || data.name === "" || data.name === null || data.suggestion === "" || data.suggestion === null)
    {
        sendSuggestions = "Please Don't Leave Any Field Empty";
        return res.redirect("/");
    }
    else
    {
        const DOMAIN = process.env.DOMAIN;
        const mg = mailgun({apiKey: process.env.API_KEY, domain: DOMAIN});
        const mail = {
            from: process.env.FROM,
            to: 'kadtlearning@gmail.com',
            subject: 'Suggestion',
            text: data.suggestion
        };
        mg.messages().send(mail, function (error, body) {
            if (error)
            {
                console.log(error);
                sendSuggestions = "Some Error Occured";
                return res.redirect("/");
            }
            else
            {
                console.log(body);
                sendSuggestions = "Suggestions Send Successfully";
                return res.redirect("/");
            }
        });
    }
});

app.get('/searchengine', checkNotAuthenticated, function(req, res) {
    console.log(req.user.email);
    res.render("searchengine");
});

app.get("/login", checkAuthenticated, function(req, res){
    console.log(req.isAuthenticated());
    res.render("login");
});

app.post("/login", passport.authenticate('users', {
    successRedirect: "/searchengine",
    failureRedirect: "/login",
    failureFlash: true
  })
);


app.get('/draw/:id', checkNotAuthenticated, (req, res) => {
    let id = req.params.id;
    // console.log('pinged', id);
    res.render('drawingboard', { roomId: id });
});

app.post('/draw/:id', checkNotAuthenticated, (req, res) => {
    let id = req.params.id;
    res.render('drawingboard', { roomId: id });
});

app.get('/drawingboard', checkNotAuthenticated, (req, res) => {
    res.render('drawingjoin');
});


app.get('/productivity', checkNotAuthenticated, function(req, res) {
    console.log(History, User);
    History.findOne({ email: req.user.email })
        .then(hist => {
            if (hist) {
                console.log(hist);
                res.render("productivity", { history: hist.timespent });
            } else {
                res.render("productivity");
            }
            
        });

});

app.get("/logout", checkNotAuthenticated, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { online: '' }).then((err, result) => {
        req.logOut();
        res.redirect("/");
    });
});

app.get("/signup", checkAuthenticated, function(req, res){
    res.render("signup");
});

app.post("/signup", function(req, res){

    user = {
        "name": req.body.name,
        "email": req.body.email,
        "password": req.body.password
    }
    if (user.name === "" || user.name === null || user.email === "" || user.email === null || user.password === "" || user.password === null)
    {
        error = "Username, Email, Or Name Can Not Be Empty";
        return res.render("signup", {error});
    }

    if (user.password.length < 6)
    {
        error = "Password Can Not Be Less Than 6 Characters";
        return res.render("signup", {error});
    }

    User.findOne({email: user.email}, function(err, userFound){
        if (err)
        {
            error = "Error Occured In The Database";
            console.log(err);
            return res.render("signup", {error});
        }
        else if (userFound)
        {
            error = "Email Already Used, Please Use Another Email";
            return res.render("signup", {error});
        }
        else
        {
            bcrypt.hash(user.password, 12, function(err1, hash){
                if (err1)
                {
                    error = "Error Occured In The Database";
                    console.log(err1);
                    return res.render("signup", {error});
                }
                else
                {
                    newUser = new User(user);
                    newUser.password = hash;
                    newUser.save(function(err2){
                        if (err2)
                        {
                            error = "Error Occured In The Database";
                            console.log(err2);
                            return res.render("signup", {error});
                        }
                        else
                        {
                            success = "Signed In Successful Please Login To Continue";
                            console.log("Signed In Successful Please Login To Continue");
                            newTimetable = new Timetable();
                            newTimetable.email = newUser.email;
                            newTimetable.save(function(err3) {
                                if (err3) {
                                    error = "Error Occured In The Database";
                                    console.log(err3);
                                    return res.render("signup", {error});
                                }
                            });
                            newHistory = new History({email: newUser.email, timespent: {}});
                            newHistory.save(function(err3) {
                                if (err3) {
                                    error = "Error Occured In The Database";
                                    console.log(err3);
                                    return res.render("signup", {error});
                                } 
                            });
                            return res.render("login", {success});
                        }
                    });
                }
            });
        }
    });
});

app.get("/chat/:type/:id", checkNotAuthenticated ,function (req, res) {
    console.log("chats");
    data = {
        'id': req.user._id, 'type': req.params.type, 'chat_id': req.params.id
    };
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
                                    var chatname, access, members=[];
                                    async function addinfo() {
                                        msgs = await Promise.all(msgs.map(async (msg) => {
                                            await User.findById(msg.sender).then(friend => { msg["sendername"] = friend.name; })
                                            .catch(err => { res.status(500).send("Internal Server error") })
                                            return msg
                                        })
                                        )
                                    }
                                    async function addmembers() {
                                        members = await Promise.all(members.map(async (member) => {
                                            await User.findById(member).then(friend => { member = friend.name })
                                                .catch(err => { res.status(500).send("Internal Server error") })
                                            return member;
                                        }))
                                    }
                                    async function addname() {
                                        if (data.type == "group") {
                                            await Groups.findById({ _id: data.chat_id }).then(async (group) => {
                                                if (group != null) {
                                                    chatname = group.name;
                                                    members = group.users.map(user => user.toString())
                                                    if (members.includes(result._id.toString())) {
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
                                            console.log("members", members);
                                            res.render('chats.ejs', { users, receiver: result, msgs, chatname, chat_id: chat_id, groups, access ,members });
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

app.get('/group/new', checkNotAuthenticated, (req, res) => {
        res.render('group_form', { error: 'none' ,type : "new"});
})


app.get('/group/join', checkNotAuthenticated,(req, res) => {
        res.render('group_form', { error: 'none' , type:"join"});
})

app.post('/group/new', checkNotAuthenticated, (req, res) => {
    Groups.findOne({ name: req.body.groupname }).then(result => {
        if (result != null) {
            error = "This group name already exists. Choose a different name."
            res.render('group_form', {  error,type:"new"})
        }
        else {
            const newgroup = new Groups({
                name: req.body.groupname,
                users: [req.user._id]
            })
            newgroup.save().then((result) => {
                res.redirect(`../chat/group/${result._id}`)
            });
        }
    })
})


app.post('/group/join', checkNotAuthenticated, (req, res) => {
    Groups.findOne({ name: req.body.groupname }).then(result => {
        if (result != null) {
            Groups.findOneAndUpdate({ name: req.body.groupname }, { $addToSet: { users: [req.user._id] } }, { new: true }, (err, result) => {
                if (!err && result != null)
                    res.redirect(`../chat/group/${result._id}`);
            })
        }
        else {
            error = "This group name does not exist"
            res.render('group_form', { error  , type: "join" });
        }
    })
})

function compareTasks(first, second) {
    firststarttime = parseInt(first.starttime.substring(0, 2)) * 60 + parseInt(first.starttime.substring(3, 5));
    secondstarttime = parseInt(second.starttime.substring(0, 2)) * 60 + parseInt(second.starttime.substring(3, 5));
    if (firststarttime == secondstarttime) {
        return 0;
    } else if (firststarttime > secondstarttime) {
        return 1;
    } else {
        return -1;
    }
}

function getDaysTasks(tt, day) {
    switch (day) {
        case 0:
            return tt.sunday;
        case 1:
            return tt.monday;
        case 2:
            return tt.tuesday;
        case 3:
            return tt.wednesday;
        case 4:
            return tt.thursday;
        case 5:
            return tt.friday;
        case 6:
            return tt.saturday;
    }
}

app.get("/timetable", checkNotAuthenticated, function(req, res) {
    Timetable.findOne({ email: req.user.email })
        .then(tt => {
            let dateObj = new Date();
            let day = dateObj.getDay();
            console.log(day);
            var tasks = getDaysTasks(tt, day);
            tasks.sort(compareTasks);
            // console.log(req.user._id);
            res.render("timetable", { currDay: day, tasks: tasks, userid: tt._id });
        });
});

app.get("/viewtimetable/:id", function(req, res) {
    let id = req.params.id;
    console.log(id);
    Timetable.findById(id)
        .then(tt => {
            console.log(tt);
            let dateObj = new Date();
            let day = dateObj.getDay();
            console.log(day);
            var tasks = getDaysTasks(tt, day);
            tasks.sort(compareTasks);
            // console.log(req.user._id);
            res.render("viewtimetable", { currDay: day, tasks: tasks, userid: tt._id });
        });
});

app.post("/viewtimetable/:id", function(req, res) {
    let id = req.params.id;
    let currDay = req.body.newDay;
    Timetable.findById(id)
        .then(tt => {
            var tasks = getDaysTasks(tt, Number(currDay));
            tasks.sort(compareTasks);
            console.log(currDay);
            res.render("viewtimetable", { currDay: currDay, tasks: tasks, userid: tt._id });
        });
});

app.post("/timetable", function(req, res) {
    let currDay = req.body.newDay;
    Timetable.findOne({ email: req.user.email })
        .then(tt => {
            var tasks = getDaysTasks(tt, Number(currDay));
            tasks.sort(compareTasks);
            console.log(currDay);
            res.render("timetable", { currDay: currDay, tasks: tasks, userid: tt._id });
        });
});

app.post("/usetimetable/:id", function(req, res) {
    let id = req.params.id;
    console.log(id);
    Timetable.findById(id)
        .then(tt => {
            console.log(tt);
            Timetable.updateOne({email: req.user.email}, {
                monday: tt.monday, 
                tuesday: tt.tuesday,
                wednesday: tt.wednesday,
                thursday: tt.thursday,
                friday: tt.friday,
                saturday: tt.saturday,
                sunday: tt.sunday
            }).then(tt2 => {
                console.log(tt2);
            });
            res.redirect('/timetable');
        });
});

function insertSchedule(dayNum, title, start, end) {
    let task = { title: title, starttime: start, endtime: end }
    switch (dayNum) {
        case 0:
            return { sunday: task };
        case 1:
            return { monday: task };
        case 2:
            return { tuesday: task };
        case 3:
            return { wednesday: task };
        case 4:
            return { thursday: task };
        case 5:
            return { friday: task };
        case 6:
            return { saturday: task };
    }
}

app.post('/timetableInsert', checkNotAuthenticated, function(req, res) {
    let { dayName, task, starttime, endtime } = req.body;
    console.log(dayName, task, starttime, endtime);
    Timetable.updateOne({ email: req.user.email }, {
            $push: insertSchedule(Number(dayName), task, starttime, endtime)
        })
        .then(res => console.log(res))
});

function deleteSchedule(dayNum, start) {
    let task = { starttime: start }
    switch (dayNum) {
        case 0:
            return { sunday: task };
        case 1:
            return { monday: task };
        case 2:
            return { tuesday: task };
        case 3:
            return { wednesday: task };
        case 4:
            return { thursday: task };
        case 5:
            return { friday: task };
        case 6:
            return { saturday: task };
    }
}

app.post('/deleteSchedule', function(req, res) {
    console.log(req.body);
    let { delstarttime, delendtime, delDayName } = req.body;
    console.log(delstarttime, delendtime, delDayName);
    // Timetable.findOne({ username: "tanvee" })
    //     .then(tt => {
    //         console.log(tt);
    //     });
    Timetable.updateOne({ email: req.user.email }, { $pull: deleteSchedule(Number(delDayName), delstarttime) /*{ sunday: { starttime: "09:00" } }*/ }).then(res => console.log(res));
});




// For whiteboard **************************


const rooms = {} // can keep track of all the rooms , there players, there ids,
var colors = ['red', 'yellow', 'red', 'pink', 'green', 'orange', 'blue'];


const joinRoom = (socket, room) => {
    room.sockets.push(socket);
    room.user_id.push(socket.name);

    socket.join(room.id, () => {
        // store the room id in the socket for future use
        socket.roomId = room.id;
        console.log(socket.id, "Joined", room.id);
    });
    console.log(room.sockets.length);
};

const leaveRooms = (socket) => {
    const roomsToDelete = [];
    for (const id in rooms) {
        const room = rooms[id];
        if (room.sockets.includes(socket)) {
            socket.leave(id);
            room.sockets = room.sockets.filter((item) => item !== socket);
        }
        if (room.sockets.length == 0) {
            roomsToDelete.push(room);
        }
    }
    for (const room of roomsToDelete) {
        console.log('Deleting ' + room.id);
        delete rooms[room.id];
    }
};





io.on('connection', function (socket) {

   
    socket.color = colors[Math.floor(Math.random() * colors.length)];

    socket.color = colors[Math.floor(Math.random() * colors.length)];


    socket.on('draw_line', function(data) {

        let room_id = socket.roomId;
        console.log('draw ', room_id);
        rooms[room_id].line_history.push(data.line);
        for (sock of rooms[room_id].sockets) {
            sock.emit('draw_line', { line: data.line });
        }

    });

    socket.on('clear_canvas', function(data) {
        let room_id = socket.roomId;
        rooms[room_id].line_history = [];
        for (sock of rooms[room_id].sockets) {
            sock.emit('clear_canvas', {});
        }
    });


    socket.on('draw_cursor', function(data) {
        let room_id = socket.roomId;
        for (sock of rooms[room_id].sockets) {
            sock.emit('draw_cursor', { line: data.line, id: sock.id, color: socket.color });
        }
    });



    //Gets fired when someone wants to get the list of rooms. respond with the list of room names.
    socket.on('getRoomNames', (data, callback) => {
        const roomNames = [];
        for (const id in rooms) {
            const { name } = rooms[id];
            const room = { name, id };
            roomNames.push(room);
        }
        callback(roomNames);
    });

    function uniqueRoomID() {
        var roomids = Object.keys(rooms);
        var room;

        function codeCreate() {
            var i;
            var s = '';
            var num;
            for (i = 0; i <= 5; i++) {
                num = Math.random() * 25;
                s += String.fromCharCode(65 + num);
            }
            return s;
        }
        room = codeCreate();
        while (roomids.includes(room)) {
            room = codeCreate();
        }
        return room;
    }

    socket.on('checkRoomId', (roomid) => {
        if (roomid in rooms) {
            socket.emit('validRoomId', roomid);
            console.log('valid');
        } else {
            socket.emit('invalidRoomId');
            console.log('invalid');
        }
    });

    //Gets fired when a user wants to create a new room.
    socket.on('createRoom', () => {
        let id = uniqueRoomID();
        socket.emit('roomId', id);
    });

    //Gets fired when a player has joined a room.
    socket.on('joinRoom', (roomId) => {
        console.log('Trying to connect to: #' + roomId + "#");
        socket.roomId = roomId;
        socket.name = "";
        if (roomId in rooms) {
            let room = rooms[roomId];
            // console.log(room.line_history);
            joinRoom(socket, room);
            for (var i of room.line_history) { // do something
                socket.emit('draw_line', { line: i });
            }
        } else {
            const room = {
                id: roomId,
                sockets: [],
                line_history: [], // this i changed
                user_id: [] // user ids of all the sockets connected;
            };
            rooms[room.id] = room;
            joinRoom(socket, room);
        }
    });


    socket.on("new", (user) => {
        User.findByIdAndUpdate(user._id, { online: socket.id }, { new: true }, (err, result) => {
            if (!err) socket.broadcast.emit("new-user", { id: result._id, name: result.name })
            else res.status(403).send("Access Forbidden");
        });
    }
    )
    socket.on("disconnect", () => {
        User.findOneAndUpdate({ online: socket.id }, { online: '' }, { new: true }, function (err, result) {
            if (!err && result != null) io.emit("user-disconnected", result._id);
        });
        leaveRooms(socket);
    });

    async function group_emit(event , msg, friend) {
        Groups.findById({ _id: msg.chat_id }).then(group => {
            group.users.forEach(user => {
                User.findById( user ).then(result => {
                    if (result.online != '') {
                        io.to(result.online).emit(event, { 'msg': msg.msg, 'sender': friend, 'chat_id': msg.chat_id });
                        }
                })
            })
        })
    }

    async function private_emit(event, msg, friend) {
        var emit_to = msg.chat_id.slice(0, 24) == friend._id ? msg.chat_id.slice(-24,) : msg.chat_id.slice(0, 24);
        User.findById(emit_to).then(result => {
            if (result.online != '') {
                io.to(result.online).emit(event, { 'msg': msg.msg, 'sender': friend, 'chat_id': msg.chat_id });
            }
        })
    }
    socket.on("chat-message", (msg) => {
        User.findById(msg.sender._id, function (err, friend) {
            const message = new Messages({ sender: friend, chat_id: msg.chat_id, msg: msg.msg });
            if (msg.chat_id.toString().length == 24) {
                message.save().then(async function () {
                    await group_emit("chat-message", msg, friend);
                })
            }
            else
            {
                message.save().then(async function () {
                    io.to(socket.id).emit("chat-message", { 'msg': msg.msg, 'sender': friend, 'chat_id': msg.chat_id });
                    await private_emit('chat-message', msg, friend);
                })
            }
        })
    });

    socket.on("typing", data => {
        if (data.chat_id.toString().length == 24) {
            User.findById(data.sender._id).then(friend => {group_emit("typing", { msg: null, chat_id: data.chat_id }, friend);})
        }
        else {
            User.findById(data.sender._id).then(friend => { private_emit("typing", { msg: null, chat_id: data.chat_id }, friend);})
        }
    })
})


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/searchengine");
    }
    next();
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}