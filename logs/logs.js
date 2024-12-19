const { createLogger, format, transports } = require("winston");

const path = "./logs/service-logs.log";

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.printf(
      ({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`
    )
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: `${path}` }),
  ],
});

module.exports = { logger };
