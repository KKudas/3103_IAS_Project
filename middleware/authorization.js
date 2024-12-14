// Authorization middleware to check user roles and authenticate tokens
const jwt = require("jsonwebtoken");
const SECRET_KEY = "Microservice";

// Function to authenticate jwt token
function authenticateToken() {
  return (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(403).json("Unauthorized");
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res
          .status(403)
          .send("Unauthorized: You do not have the required permissions");
      }
      req.user = user;
      next();
    });
  };
}

// Function to check user roles
function authorization(allowedRoles) {
  return (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(403).json("Unauthorized");
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res
          .status(403)
          .send("Unauthorized: You do not have the required permissions");
      }

      if (!allowedRoles.includes(user.role)) {
        return res
          .status(403)
          .send(
            "Forbidden: You do not have permission to access this resource"
          );
      }
      req.user = user;
      next();
    });
  };
}

module.exports = { authorization, authenticateToken };
