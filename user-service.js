// Dependencies
const express = require("express");
const jwt = require("jsonwebtoken");
const https = require("https");
const fs = require("fs");

// Middlewares
const { authenticateToken } = require("./middleware/authorization.js");
const {
  validateId,
  validateUserParams,
  validateUserLoginParams,
} = require("./middleware/sanitation.js");
const limiter = require("./middleware/limiter.js");

// Load SSL certificates
const options = {
  key: fs.readFileSync("./certs/localhost-key.pem"),
  cert: fs.readFileSync("./certs/localhost-cert.pem"),
};

const app = express();
const port = 3002;
const SECRET_KEY = "Microservice";
app.use(express.json());

let id = 1;
let users = [];

// Generate JWT Token
function generateToken(user) {
  const payload = {
    id: user.id,
    role: user.role,
  };
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
}

// POST /login: Login
app.post("/login", limiter, validateUserLoginParams(), (req, res) => {
  try {
    const { username, password } = req.body;

    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      const token = generateToken(user);
      res.json({ token });
    } else {
      res.status(401).send("Wrong username or password");
    }
  } catch (error) {
    res.status(500).json({ error: "There was an error logging in" });
  }
});

// POST /: Add a new user.
app.post("/", limiter, validateUserParams(), (req, res) => {
  try {
    const data = {
      id: id++,
      username: req.body.username,
      password: req.body.password,
      role: req.body.role,
    };
    users.push(data);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "There was an error adding a new user" });
  }
});

// GET /:id: Get user details by ID.
app.get("/:id", limiter, validateId("id"), authenticateToken(), (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (userId === req.user.id || req.user.role === "admin") {
      const data = users.find((user) => user.id === userId);

      if (!data) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(data);
    } else {
      res.status(403).json({ message: "Unauthorized Access" });
    }
  } catch (error) {
    res.status(500).json({ error: "There was an error fetching the user" });
  }
});

// PUT /id: Update user information
app.put("/:id", limiter, validateId("id"), authenticateToken(), (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (userId === req.user.id || req.user.role === "admin") {
      const index = users.findIndex((user) => {
        return user.id === userId;
      });

      if (index === -1) {
        return res.status(404).json({ message: "User not found" });
      }

      users[index] = { ...users[index], ...req.body };
      res.status(200).json({ message: "User successfully updated" });
    } else {
      res.status(403).json({ message: "Unauthorized Access" });
    }
  } catch (error) {
    res.status(500).json({ error: "There was an error updating the user" });
  }
});

// DELETE /users/:userId: Delete a user.
app.delete(
  "/:id",
  limiter,
  validateId("id"),
  authenticateToken(),
  (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);

      if (userId === req.user.id || req.user.role === "admin") {
        const index = users.findIndex((user) => {
          return user.id === userId;
        });

        if (index === -1) {
          return res.status(404).json({ message: "User not found" });
        }
        users.splice(index, 1);
        res.status(200).json({ message: "User successfully deleted" });
      } else {
        res.status(403).json({ message: "Unauthorized Access" });
      }
    } catch (error) {
      res.status(500).json({ error: "There was an error deleting the use" });
    }
  }
);

// Secure HTTPS server
https.createServer(options, app).listen(port, () => {
  console.log(`Order service running securely on port ${port}`);
});
