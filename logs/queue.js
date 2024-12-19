const Bull = require("bull");

const queue = new Bull("user-queue", {
  redis: {
    host: "127.0.0.1", // Redis host
    port: 6379, // Redis port
  },
});

module.exports = queue;
