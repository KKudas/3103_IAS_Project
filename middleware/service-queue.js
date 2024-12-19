// Middleware: service-queue.js
const queue = require("../logs/queue");
const { User } = require("../models/usermodel");
const { Inventory } = require("../models/inventorymodel");
const { Order } = require("../models/ordermodel");
const { Tickets } = require("../models/supportmodel");
const { logger } = require("../logs/logs");
const axios = require("axios");
const https = require("https");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

queue.process("register-user", async (job) => {
  const { username, email, password, role } = job.data;

  try {
    const user = await User.create({
      github_id: null,
      username,
      email,
      password,
      role,
    });

    logger.info(`User successfully registered: ${username} (${email})`);
    return user;
  } catch (error) {
    logger.error(
      `Error processing registration for username: ${username}, Error: ${error.message}`
    );
    throw error; // Allows Bull to retry the job
  }
});

queue.process("login-attempt", async (job) => {
  const { username, success } = job.data;

  try {
    if (success) {
      logger.info(`Login attempt successful for username: ${username}`);
    } else {
      logger.warn(`Login attempt failed for username: ${username}`);
    }
  } catch (error) {
    logger.error(
      `Error processing login attempt for username: ${username}, Error: ${error.message}`
    );
    throw error; // Allows Bull to retry the job if necessary
  }
});

// Process the "delete-user" queue
queue.process("delete-user", async (job) => {
  const { userId } = job.data;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      logger.warn(`User not found for deletion: ID ${userId}`);
      return;
    }

    await user.destroy();
    logger.info(`User successfully deleted: ID ${userId}`);
  } catch (error) {
    logger.error(`Error deleting user ID ${userId}: ${error.message}`);
    throw error; // Allows Bull to retry the job
  }
});

queue.process("add-product", async (job) => {
  const { name, price, quantity } = job.data;

  try {
    const data = await Inventory.create({
      name,
      price,
      quantity,
    });

    logger.info(`Product successfully added: ${name}`);
    return data;
  } catch (error) {
    logger.error(`Error adding product: ${error.message}`);
    throw error; // Allows Bull to retry the job
  }
});

queue.process("create-ticket", async (job) => {
  const { title, description, priority, userId } = job.data;

  try {
    const ticket = await Tickets.create({
      title,
      description,
      priority,
      userId,
    });

    logger.info(`Ticket successfully created: ${title} by user ID: ${userId}`);
    return ticket; // Send created ticket back to the client
  } catch (error) {
    logger.error(`Error creating ticket: ${error.message}`);
    throw error; // Allows Bull to retry the job
  }
});
