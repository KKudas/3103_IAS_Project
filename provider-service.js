const express = require("express");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const jwt = require("jsonwebtoken");
const https = require("https");
const fs = require("fs");
const cors = require("cors");

require("dotenv").config();

const app = express();
const port = 3004;

// SSL options
const options = {
  key: fs.readFileSync("./certs/localhost-key.pem"),
  cert: fs.readFileSync("./certs/localhost-cert.pem"),
};

app.use(cors());
app.use(passport.initialize());

// Secret configuration (use environment variables in production)
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

// In-memory user store (replace with database in production)
const users = [];

// Passport GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "https://localhost:8080/auth/github/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      // Find or create user
      let user = users.find((u) => u.githubId === profile.id);

      if (!user) {
        user = {
          id: users.length + 1,
          githubId: profile.id,
          username: profile.username,
          email:
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : null,
          role: "customer", // default role
        };
        users.push(user);
      }

      return done(null, user);
    }
  )
);

// Generate JWT Token
function generateToken(user) {
  const payload = {
    id: user.id,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

// GitHub OAuth Routes
app.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  (req, res) => {
    // Generate JWT token
    const token = generateToken(req.user);

    // Redirect to frontend with token (or send directly)
    res.redirect(`https://localhost:8080/oauth-callback?token=${token}`);
  }
);

// Endpoint to get user details
app.get("/user", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find((u) => u.id === decoded.id);

    if (user) {
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// Secure HTTPS server
https.createServer(options, app).listen(port, () => {
  console.log(`OAuth2 service running securely on port ${port}`);
});
