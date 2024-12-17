// Dependencies
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const jwt = require("jsonwebtoken");
const https = require("https");
const fs = require("fs");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { Sequelize } = require("sequelize");

const { sequelize, User } = require("./models/user.js");
require("dotenv").config();

// Middleware
const { authenticateToken } = require("./middleware/authorization.js");
const {
  validateId,
  validateUserParams,
  validateUserLoginParams,
  validateUserUpdateParams,
} = require("./middleware/sanitation.js");
const limiter = require("./middleware/limiter.js");

// Load SSL certificates
const options = {
  key: fs.readFileSync("./certs/localhost-key.pem"),
  cert: fs.readFileSync("./certs/localhost-cert.pem"),
};

// Environment Variables
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
const port = 4002;
app.use(express.json());
app.use(cors());
app.use(
  session({
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());

// Helper function: Generate JWT Token
function generateToken(user) {
  const payload = {
    id: user.id,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

// Github Provider using OAuth2
passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "https://localhost:8080/users/auth/github/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        // Find or create GitHub user
        let user = await User.findOne({ where: { github_id: profile.id } });

        if (!user) {
          user = await User.create({
            github_id: profile.id,
            username: profile.username,
            email: profile.emails?.[0]?.value || null,
            role: "customer", // default role
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { session: false }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user);

      // Send the token as JSON response
      res.json({
        message: "User successfully logged in",
        token,
      });
    } catch (error) {
      console.error("Error generating token:", error);
      res.status(500).json({ error: "Failed to generate token" });
    }
  }
);

// POST /register: Register a new user
app.post("/register", limiter, validateUserParams(), async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const existingUser = await User.findOne({
      where: {
        username: username,
        email: email,
      },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      github_id: null,
      username,
      email,
      password: hashedPassword,
      role: role || "customer",
    });

    res.status(201).json({ message: "User successfully registered" });
  } catch (error) {
    res.status(500).json({ error: "Error registering user" });
  }
});

// POST /login: Login user
app.post("/login", limiter, validateUserLoginParams(), async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      where: {
        [Sequelize.Op.or]: [{ username: username }, { email: username }],
      },
    });

    if (!user) {
      return res.status(401).send("Wrong username or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send("Wrong username or password");
    }

    const token = generateToken(user);
    res.json({ id: user.id, message: "User successfully logged in", token });
  } catch (error) {
    res.status(500).json({ error: "There was an error logging in" });
  }
});

// GET /: Get all users
app.get("/", limiter, authenticateToken(), async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "There was an error fetching the users" });
  }
});

// GET /:id: Get user details by ID
app.get(
  "/:id",
  limiter,
  validateId("id"),
  authenticateToken(),
  async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (userId === req.user.id || req.user.role === "admin") {
        res.json(user);
      } else {
        res.status(403).json({ message: "Unauthorized Access" });
      }
    } catch (error) {
      res.status(500).json({ error: "There was an error fetching the user" });
    }
  }
);

// PUT /:id: Update user information
app.put(
  "/:id",
  limiter,
  validateId("id"),
  validateUserUpdateParams(),
  authenticateToken(),
  async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (req.body.github_id) {
        return res.status(400).json({ error: "Cannot update github_id" });
      }

      if (userId === req.user.id || req.user.role === "admin") {
        await user.update(req.body);
        res.status(200).json({ message: "User successfully updated" });
      } else {
        res.status(403).json({ message: "Unauthorized Access" });
      }
    } catch (error) {
      res.status(500).json({ error: "There was an error updating the user" });
    }
  }
);

// DELETE /:id: Delete a user
app.delete(
  "/:id",
  limiter,
  validateId("id"),
  authenticateToken(),
  async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only the user or admin can delete their own data
      if (userId === req.user.id || req.user.role === "admin") {
        await user.destroy();
        res.status(200).json({ message: "User successfully deleted" });
      } else {
        res.status(403).json({ message: "Unauthorized Access" });
      }
    } catch (error) {
      res.status(500).json({ error: "There was an error deleting the user" });
    }
  }
);

// Secure HTTPS server
https.createServer(options, app).listen(port, () => {
  console.log(`User service running securely on port ${port}`);
});
