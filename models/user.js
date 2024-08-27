const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Match = require("./match.js");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 400,
  },
  state: {
    type: Boolean,
  },
  isPlaying: {
    type: Boolean,
    default: false,
  },
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  requests: [String],
  matches: [
    {
      type: Schema.Types.ObjectId,
      ref: "Match",
    },
  ],
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
