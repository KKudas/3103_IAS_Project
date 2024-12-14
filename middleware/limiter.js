// Rate Limiter middleware to limit user requests

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 10, // 10 request
  message: "Too many request, try again later",
});

module.exports = limiter;
