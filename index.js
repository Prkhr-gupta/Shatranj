const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const app = express();
const port = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

app.get("/", (req, res) => {
  res.render("pages/home.ejs");
});

app.get("/computer", (req, res) => {
  res.render("pages/computer");
});

app.listen(port, () => {
  console.log("App is listening on port 8080");
});
