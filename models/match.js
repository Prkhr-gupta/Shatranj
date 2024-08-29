const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const matchSchema = new Schema({
  roomId: String,
  mode: String,
  player1: String,
  player2: String,
  result: String,
  ratingChange: Number,
  newRating: Number,
  moves: Number,
  date: String,
  time: String,
  history: [String],
  gameFEN: [String],
});

const Match = mongoose.model("Match", matchSchema);
module.exports = Match;
