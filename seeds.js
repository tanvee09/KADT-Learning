const mongoose = require('mongoose');
const Timetable = require('./models/timetableModel');
const { User } = require('./models/userModel');
const Group = require('./models/groups');

mongoose.connect('mongodb://localhost:27017/kadtApp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN");
        User.deleteMany({}).then(
            User.insertMany({
                name: "Kopal",
                email: "kopal@KADT.com",
                online: ''
            }
            ))
        Group.deleteMany({}).then((err, result) => {
            User.find({ name: "Kopal" }).then((userone) => {
                var id = userone[0]._id;
                console.log(userone, userone[0]._id, id);
                Group.insertMany([{
                    name: 'KADT',
                    users: [id]
                }])
            })
        })
            Timetable.deleteMany({}).then(
                Timetable.insertMany([
                    {
                        username: "Kopal",
                        monday: [
                            {
                                title: "study",
                                starttime: "04:00",
                                endtime: "07:00"
                            },
                            {
                                title: "sleep",
                                starttime: "09:00",
                                endtime: "10:00"
                            }
                        ],
                        tuesday: [
                            {
                                title: "study",
                                starttime: "03:00",
                                endtime: "07:00"
                            },
                            {
                                title: "sleep",
                                starttime: "09:00",
                                endtime: "11:00"
                            }
                        ],
                        wednesday: [
                            {
                                title: "study",
                                starttime: "04:00",
                                endtime: "08:00"
                            },
                            {
                                title: "sleep",
                                starttime: "09:00",
                                endtime: "10:00"
                            }
                        ],
                        thursday: [
                            {
                                title: "study",
                                starttime: "04:00",
                                endtime: "07:00"
                            },
                            {
                                title: "sleep",
                                starttime: "07:00",
                                endtime: "10:00"
                            }
                        ],
                        friday: [
                            {
                                title: "study",
                                starttime: "04:00",
                                endtime: "05:00"
                            },
                            {
                                title: "sleep",
                                starttime: "09:00",
                                endtime: "10:00"
                            }
                        ],
                        saturday: [
                            {
                                title: "study",
                                starttime: "04:00",
                                endtime: "07:00"
                            },
                            {
                                title: "sleep",
                                starttime: "09:00",
                                endtime: "10:30"
                            }
                        ],
                        sunday: [
                            {
                                title: "study",
                                starttime: "04:00",
                                endtime: "07:40"
                            },
                            {
                                title: "sleep",
                                starttime: "09:00",
                                endtime: "10:00"
                            }
                        ]
                    }
                ])
            )
        })
        .catch(err => {
            console.log("MONGO CONNECTION ERROR");
            console.log(err);
        })
 
