const express = require("express");
const router = express.Router();
const { isLoggedIn, saveRedirectUrl } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {
  showFriends,
  findUser,
  chatUser,
  readChats,
  unreadChats,
  allUnreadChats,
  signupForm,
  signup,
  loginForm,
  login,
  logout,
  profile,
} = require("../controllers/user.js");

router.get("/friends", isLoggedIn, wrapAsync(showFriends));

router.get("/find/:username", wrapAsync(findUser));

router.get("/chats/:username/:friend", wrapAsync(chatUser));

router.get("/read/:username/:friend", wrapAsync(readChats));

router.get("/unread/:username/:friend", wrapAsync(unreadChats));

router.get("/unread/:username", wrapAsync(allUnreadChats));

router.route("/signup").get(signupForm).post(wrapAsync(signup));

router
  .route("/login")
  .get(loginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/user/login",
      failureFlash: true,
    }),
    login
  );

router.get("/logout", logout);

router.get("/:username", wrapAsync(profile));

module.exports = router;
