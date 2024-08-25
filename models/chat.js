const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  message: {
    type: String,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  time: {
    type: Date,
    required: true,
  },
});

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
