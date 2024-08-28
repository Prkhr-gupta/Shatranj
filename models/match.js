const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const matchSchema = new Schema({
  mode: String,
  opponent: String,
  result: String,
  ratingChange: Number,
  newRating: Number,
  moves: Number,
  date: Date,
  history: [String],
  verbose: [],
});

const Match = mongoose.model("Match", matchSchema);
module.exports = Match;
