const express = require("express");
const passport = require("passport");
const session = require("express-session");
const path = require("path");
const app = express();
require("./auth");

app.use(express.json());
app.use(express.static(path.join(__dirname, "client")));

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/google/protected",
    failureRedirect: "/auth/google/failure",
  })
);

app.get("/auth/google/failure", (req, res) => {
  res.send("SomeThing Went Wrong!");
});

app.get("/auth/google/protected", isLoggedIn, (req, res) => {
  let name = req.user.displayName;
  res.send(`Hello ${name}`);
});

app.use("/auth/google/logout", (req, res) => {
  req.session.destroy();
  res.send("Thank you!");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
