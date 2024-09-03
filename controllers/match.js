const Match = require("../models/match.js");

module.exports.playComputer = (req, res) => {
  res.render("pages/computer");
};

module.exports.playOnline = (req, res) => {
  res.render("pages/online.ejs");
};

module.exports.reviewMatch = async (req, res) => {
  let { gameId } = req.params;
  let match = await Match.findById(gameId);
  res.render("pages/review.ejs", { match });
};
