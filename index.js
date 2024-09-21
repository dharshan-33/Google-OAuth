const express = require("express");
const passport = require("passport");
const session = require("express-session");
const app = express();
require("./auth");

app.use(express.json());

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

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
  passport.authenticate("google", { failureRedirect: "/auth/google/failure" }),
  (req, res, next) => {
    if (!req.user) {
      return next(new Error("User not authenticated"));
    }
    res.json({
      message: "Authentication successful",
      user: req.user,
    });
  }
);

app.get("/auth/google/failure", (req, res) => {
  res.status(401).json({
    error: "Authentication failed",
  });
});

app.get("/auth/google/protected", isLoggedIn, (req, res) => {
  res.json({
    message: `Hello ${req.user.displayName}`,
  });
});

app.post("/auth/google/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to log out" });
    }
    req.session.destroy();
    res.json({
      message: "Logged out successfully",
    });
  });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
