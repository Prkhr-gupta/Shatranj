const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const myIo = require("./socket/io.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const Match = require("./models/match.js");
const User = require("./models/user.js");
const Chat = require("./models/chat.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { isLoggedIn, saveRedirectUrl } = require("./middleware.js");

const app = express();
const server = createServer(app);
const io = new Server(server);
myIo(io);
const port = 8080;

const Mongo_URL = "mongodb://127.0.0.1:27017/shatranj";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(Mongo_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 2 * 24 * 60 * 60 * 1000,
    maxAge: 2 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.get("/", (req, res) => {
  res.render("pages/home.ejs");
});

// app.get("/testMatch", async (req, res) => {
//   let sampleMatch = new Match({
//     roomId: "randomId123",
//     history: ["e4", "e5"],
//     verbose: [
//       {
//         from: "e2",
//         to: "e4",
//         flags: "b",
//       },
//       {
//         from: "e2",
//         to: "e4",
//       },
//     ],
//     lastMoveColor: "black",
//     player1Color: "white",
//     player2Color: "black",
//     gameHasStarted: true,
//     gameOver: true,
//     timer1: 12,
//     timer2: 0,
//     chats: [
//       { text: "hello", color: "white" },
//       { text: "hi", color: "black" },
//       { text: "noob", color: "white" },
//     ],
//   });
//   sampleMatch.markModified("verbose");
//   await sampleMatch.save();
//   res.send("Match saved");
// });

app.get("/computer", (req, res) => {
  res.render("pages/computer");
});

app.get("/online", isLoggedIn, (req, res) => {
  res.render("pages/bullet.ejs");
});

app.get("/friends", isLoggedIn, async (req, res) => {
  let username = req.user.username;
  let currUser = await User.findOne({ username: `${username}` }).populate(
    "friends"
  );
  res.render("pages/friends.ejs", { currUser });
});

app.get("/user/find/:username", async (req, res) => {
  let { username } = req.params;
  let user = await User.findOne({ username: `${username}` });
  res.send(user);
});

app.get("/user/chats/:username/:friend", async (req, res) => {
  let { username, friend } = req.params;
  console.log(username, friend);
  let chats = await Chat.find({
    $or: [
      { from: username, to: friend },
      { from: friend, to: username },
    ],
  });
  await Chat.updateMany(
    { from: friend, to: username },
    { $set: { isRead: true } }
  );
  res.send(chats);
});

app.get("/user/unread/:username/:friend", async (req, res) => {
  let { username, friend } = req.params;
  let unReadCnt = await Chat.countDocuments({
    from: friend,
    to: username,
    isRead: false,
  });
  res.send(`${unReadCnt}`);
});

app.get("/user/unread/:username", async (req, res) => {
  let { username, friend } = req.params;
  let unReadCnt = await Chat.countDocuments({
    to: username,
    isRead: false,
  });
  res.send(`${unReadCnt}`);
});

app.get("/signup", (req, res) => {
  res.render("pages/signup.ejs");
});

app.post(
  "/signup",
  wrapAsync(async (req, res) => {
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
      res.redirect("/signup");
    }
  })
);

app.get("/login", (req, res) => {
  res.render("pages/login.ejs");
});

app.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Log in successful!");
    let redirectUrl = res.locals.redirectUrl || "/";
    res.redirect(redirectUrl);
  }
);

app.get("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/");
  });
});

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Some Error Occurred" } = err;
  res.status(statusCode).render("pages/error.ejs", { message });
});

server.listen(port, () => {
  console.log("App is listening on port 8080");
});
