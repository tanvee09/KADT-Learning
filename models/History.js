const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  timespent: {
    type: Map,
    of: Number,
    required: true
  }
});

const History = new mongoose.model("History", HistorySchema);
module.exports = {History};
