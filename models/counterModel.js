// models/Counter.js
const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  _id: {
    type: String, // 'orderNumber' will be the unique identifier
    required: true,
  },
  sequence_value: {
    type: Number,
    default: 0,
  },
  last_reset_date: {
    type: Date,
    default: Date.now,
  },
});

const Counter = mongoose.model('Counter', CounterSchema);
module.exports = Counter;