const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {
  playComputer,
  playOnline,
  reviewMatch,
} = require("../controllers/match.js");

router.get("/computer", playComputer);

router.get("/online", isLoggedIn, playOnline);

router.get("/review/:gameId", wrapAsync(reviewMatch));

module.exports = router;
