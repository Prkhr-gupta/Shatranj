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
  isOnline: {
    type: Boolean,
    default: true,
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
  stats: {
    overall: {
      games: {
        type: Number,
        default: 0,
      },
      wins: {
        type: Number,
        default: 0,
      },
      loses: {
        type: Number,
        default: 0,
      },
      draws: {
        type: Number,
        default: 0,
      },
    },
    bullet: {
      games: {
        type: Number,
        default: 0,
      },
      wins: {
        type: Number,
        default: 0,
      },
      loses: {
        type: Number,
        default: 0,
      },
      draws: {
        type: Number,
        default: 0,
      },
    },
    blitz: {
      games: {
        type: Number,
        default: 0,
      },
      wins: {
        type: Number,
        default: 0,
      },
      loses: {
        type: Number,
        default: 0,
      },
      draws: {
        type: Number,
        default: 0,
      },
    },
    rapid: {
      games: {
        type: Number,
        default: 0,
      },
      wins: {
        type: Number,
        default: 0,
      },
      loses: {
        type: Number,
        default: 0,
      },
      draws: {
        type: Number,
        default: 0,
      },
    },
  },
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
