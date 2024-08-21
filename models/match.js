const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const matchSchema = new Schema({
  roomId: {
    type: String,
    required: true,
  },
  history: [String],
  verbose: [],
  lastMoveColor: String,
  player1Color: String,
  player2Color: String,
  gameHasStarted: Boolean,
  gameOver: Boolean,
  timer1: Number,
  timer2: Number,
  chats: [
    new Schema(
      {
        text: String,
        color: String,
      },
      { _id: false }
    ),
  ],
});

const Match = mongoose.model("Match", matchSchema);
module.exports = Match;
