const express = require('express');
const router = express.Router();

const History = require('../models/History.js');

// router.get('/productivity', function(req, res) {
//     History.findOne({ email: "balharatanvee@gmail.com" })
//         .then(hist => {
//             if (hist) {
//                 console.log(hist);
//                 res.render("productivity", { history: hist.timespent });
//             } else {
//                 res.render("productivity");
//             }
            
//         });
// });

module.exports = router;