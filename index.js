if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const myIo = require("./socket/io.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const matchRouter = require("./routes/match.js");
const userRouter = require("./routes/user.js");

const app = express();
const server = createServer(app);
const io = new Server(server);
myIo(io);
const port = 8080;

let localDbUrl = "mongodb://127.0.0.1:27017/shatranj";
let AtlasDbUrl = process.env.ATLASDB_URL;
const Mongo_URL = AtlasDbUrl;

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

const store = MongoStore.create({
  mongoUrl: Mongo_URL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Error in mongo session store", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
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

app.use("/match", matchRouter);

app.use("/user", userRouter);

app.get(
  "/leaderboard",
  wrapAsync(async (req, res) => {
    let allUsers = await User.find().sort({ rating: 1 });
    res.render("pages/leaderboard", { allUsers });
  })
);

app.get("/learn", (req, res) => {
  res.render("pages/learn");
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
