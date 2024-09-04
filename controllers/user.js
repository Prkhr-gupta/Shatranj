const User = require("../models/user.js");
const Chat = require("../models/chat.js");

module.exports.showFriends = async (req, res) => {
  let username = req.user.username;
  let currUser = await User.findOne({ username: `${username}` }).populate(
    "friends"
  );
  res.render("pages/friends.ejs", { currUser });
};

module.exports.findUser = async (req, res) => {
  let { username } = req.params;
  let user = await User.findOne({ username: `${username}` });
  res.send(user);
};

module.exports.chatUser = async (req, res) => {
  let { username, friend } = req.params;
  let chats = await Chat.find({
    $or: [
      { from: username, to: friend },
      { from: friend, to: username },
    ],
  });
  await Chat.updateMany(
    { from: friend, to: username, isRead: false },
    { $set: { isRead: true } }
  );
  res.send(chats);
};

module.exports.readChats = async (req, res) => {
  let { username, friend } = req.params;
  await Chat.updateMany(
    { from: friend, to: username, isRead: false },
    { $set: { isRead: true } }
  );
  res.send("null");
};

module.exports.unreadChats = async (req, res) => {
  let { username, friend } = req.params;
  let unReadCnt = await Chat.countDocuments({
    from: friend,
    to: username,
    isRead: false,
  });
  res.send(`${unReadCnt}`);
};

module.exports.allUnreadChats = async (req, res) => {
  let { username } = req.params;
  let unReadCnt = await Chat.countDocuments({
    to: username,
    isRead: false,
  });
  res.send(`${unReadCnt}`);
};

module.exports.signupForm = (req, res) => {
  res.render("pages/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Shatranj, play chess online!");
      res.redirect("/");
    });
  } catch (err) {
    req.flash("error", `${err.message}!`);
    res.redirect("/user/signup");
  }
};

module.exports.loginForm = (req, res) => {
  res.render("pages/login.ejs");
};

module.exports.login = (req, res) => {
  req.flash("success", "Log in successful!");
  let redirectUrl = res.locals.redirectUrl || "/";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/");
  });
};

module.exports.profile = async (req, res) => {
  let { username } = req.params;
  let user = await User.findOne({ username: username }).populate("matches");
  res.render("pages/games.ejs", { user });
};
