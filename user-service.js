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

const { User } = require("./models/usermodel.js");
require("dotenv").config({ path: "../../.env" });

// Middleware
const {
  authenticateToken,
  authorization,
} = require("./middleware/authorization.js");
const {
  validateId,
  validateUserParams,
  validateUserLoginParams,
  validateUserUpdateParams,
} = require("./middleware/sanitation.js");
const limiter = require("./middleware/limiter.js");
const path = require("path");
const queue = require("./logs/queue.js");
require("./middleware/service-queue.js");
const { logger } = require("./logs/logs.js");
const { log } = require("console");

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
        let user = await User.findOne({ where: { github_id: profile.id } });

        if (!user) {
          user = await User.create({
            github_id: profile.id,
            username: profile.username,
            email: profile.emails?.[0]?.value || null,
            role: "customer", // default role
          });

          logger.info(
            `; New user created with Github Provider: ${profile.username}`
          );
        }

        logger.info(`User logged in with Github Provider: ${profile.username}`);

        return done(null, user);
      } catch (error) {
        logger.error(`Error logging in with Github Provider: ${error.message}`);
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
      const token = generateToken(req.user);

      res.json({
        message: "User successfully logged in",
        token,
      });
    } catch (error) {
      console.error("Error generating token:", error);
      logger.error(`Error generating token: ${error.message}`);
      res.status(500).json({ error: "Failed to generate token" });
    }
  }
);

// [ALL] POST /register: Register a new user
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
      logger.warn(
        `Registration failed: Username or email already exists - ${username}, ${email}`
      );
      return res
        .status(409)
        .json({ error: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const job = await queue.add(
      "register-user",
      {
        username,
        email,
        password: hashedPassword,
        role: role || "customer",
      },
      {
        limiter: {
          max: 5,
          duration: 500,
        },
      }
    );

    logger.info(`Registration task added to queue for username: ${username}`);

    job
      .finished()
      .then((user) => {
        res.status(201).json({ message: "User successfully registered", user });
      })
      .catch((error) => {
        logger.error(`Error processing registration job: ${error.message}`);
        res
          .status(500)
          .json({ error: "Error registering user", details: error.message });
      });
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`);
    res.status(500).json({ error: "Error registering user" });
  }
});

// [ALL] POST /login: Login user
app.post("/login", limiter, validateUserLoginParams(), async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      where: {
        [Sequelize.Op.or]: [{ username: username }, { email: username }],
      },
    });

    if (!user) {
      logger.warn(`Login Attempt failed: Wrong username or password`);

      // Add login attempt to the queue
      await queue.add("login-attempt", {
        username: username,
        success: false,
      });

      return res.status(401).send("Wrong username or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logger.warn(`Login Attempt failed: Wrong username or password`);

      await queue.add("login-attempt", {
        username: username,
        success: false,
      });

      return res.status(401).send("Wrong username or password");
    }

    const token = generateToken(user);

    await queue.add("login-attempt", {
      username: user.username,
      success: true,
    });

    res.json({ id: user.id, message: "User successfully logged in", token });
  } catch (error) {
    logger.error(`Error logging in: ${error.message}`);
    res.status(500).json({ error: "There was an error logging in" });
  }
});

// [ADMIN] GET /: Get all users
app.get(
  "/",
  limiter,
  authenticateToken(),
  authorization(["admin"]),
  async (req, res) => {
    try {
      const users = await User.findAll();
      res.json(users);
      logger.info(`Admin ${req.user.id} fetched all users`);
    } catch (error) {
      logger.error(`Error fetching users: ${error.message}`);
      res.status(500).json({ error: "There was an error fetching the users" });
    }
  }
);

// [CUSTOMER, ADMIN, SUPPORT] GET /:id: Get user details by ID
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
        logger.warn(`User not found for ID: ${userId}`);
        return res.status(404).json({ message: "User not found" });
      }

      if (
        userId === req.user.id ||
        req.user.role === "support" ||
        req.user.role === "admin"
      ) {
        res.json(user);
        logger.info(`User details fetched for ID: ${userId}`);
      } else {
        res.status(403).json({ message: "Unauthorized Access" });
      }
    } catch (error) {
      logger.error(`Error fetching user: ${error.message}`);
      res.status(500).json({ error: "There was an error fetching the user" });
    }
  }
);

// [CUSTOMER, ADMIN, SUPPORT] PUT /:id: Update user information
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
        logger.warn(`User not found for ID: ${userId}`);
        return res.status(404).json({ message: "User not found" });
      }

      if (req.body.github_id) {
        logger.warn(`Update attempt failed: Cannot update github_id`);
        return res.status(400).json({ error: "Cannot update github_id" });
      }

      if (req.body.role && req.user.role !== "admin") {
        logger.warn(`Update attempt failed: Admin can only update roles`);
        return res.status(403).json({ message: "Admin can only update roles" });
      }

      if (
        userId === req.user.id ||
        req.user.role === "support" ||
        req.user.role === "admin"
      ) {
        await user.update(req.body);
        res.status(200).json({ message: "User successfully updated", user });

        logger.info(`User details updated for ID: ${userId}`);
      } else {
        res.status(403).json({ message: "Unauthorized Access" });
      }
    } catch (error) {
      logger.error(`Error updating user: ${error.message}`);
      res.status(500).json({ error: "There was an error updating the user" });
    }
  }
);

// [CUSTOMER, ADMIN, SUPPORT] DELETE /:id: Delete a user
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
        logger.warn(`User not found for deletion: ID ${userId}`);
        return res.status(404).json({ message: "User not found" });
      }

      if (
        userId === req.user.id ||
        req.user.role === "support" ||
        req.user.role === "admin"
      ) {
        await user.destroy();
        res.status(200).json({ message: "User successfully deleted" });
        logger.info(`User deleted for ID: ${userId}`);
      } else {
        res.status(403).json({ message: "Unauthorized Access" });
      }
    } catch (error) {
      logger.error
      res.status(500).json({ error: "There was an error deleting the user" });
    }
  }
);

// Secure HTTPS server
https.createServer(options, app).listen(port, () => {
  console.log(`User service running securely on port ${port}`);
});
