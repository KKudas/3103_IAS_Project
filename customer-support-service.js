// Dependencies
const express = require("express");
const https = require("https");
const fs = require("fs");
const { Sequelize } = require("sequelize");
const { sequelize, Tickets } = require("./models/supportmodel.js");
const { User } = require("./models/usermodel.js"); // Import User model

// Middlewares
const {
  authorization,
  authenticateToken,
} = require("./middleware/authorization.js");
const {
  validateId,
  validateTicketParams,
  validateTicketUpdateParams,
} = require("./middleware/sanitation.js");
const limiter = require("./middleware/limiter.js");
const queue = require("./logs/queue.js");
require("./middleware/service-queue.js");
const { logger } = require("./logs/logs.js");

// Define associations
Tickets.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Tickets, { foreignKey: "userId" });

// Load SSL certificates
const options = {
  key: fs.readFileSync("./certs/localhost-key.pem"),
  cert: fs.readFileSync("./certs/localhost-cert.pem"),
};

const app = express();
const port = 4004;
app.use(express.json());

// Sync models before starting the server
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database synced");

    // POST /tickets: [Customer] Create a new ticket
    app.post(
      "/tickets",
      limiter,
      validateTicketParams(),
      authorization(["customer", "admin"]),
      async (req, res) => {
        try {
          const { title, description, priority } = req.body;
          const userId = req.user.id;

          const job = await queue.add("create-ticket", {
            title,
            description,
            priority,
            userId,
          });

          logger.info(
            `Ticket creation task added to queue for user ID: ${userId}`
          );

          job
            .finished()
            .then((ticket) => {
              res
                .status(201)
                .json({ message: "Ticket successfully created", ticket });
            })
            .catch((error) => {
              logger.error(
                `Error processing ticket creation job: ${error.message}`
              );
              res.status(500).json({
                error: "Error creating the ticket",
                details: error.message,
              });
            });
        } catch (error) {
          res
            .status(500)
            .json({ error: "There was an error creating the ticket" });
        }
      }
    );

    // GET /tickets: [Admin, Customer] Get all tickets
    app.get(
      "/tickets",
      limiter,
      authenticateToken(),
      authorization(["admin", "customer"]),
      async (req, res) => {
        try {
          if (req.user.role === "admin") {
            logger.info(`Admin user ${req.user.id} fetching all tickets`);
            const tickets = await Tickets.findAll();
            res.status(200).json(tickets);
          } else {
            logger.info(`Customer user ${req.user.id} fetching their tickets`);
            const tickets = await Tickets.findAll({
              where: { userId: req.user.id },
            });
            res.status(200).json(tickets);
          }
        } catch (error) {
          logger.error(`Error fetching tickets: ${error.message}`);
          res
            .status(500)
            .json({ error: "There was an error fetching the tickets" });
        }
      }
    );

    // GET /tickets/:id: [Admin, Customer] Get ticket details by ID
    app.get(
      "/tickets/:id",
      limiter,
      validateId("id"),
      authenticateToken(),
      authorization(["admin", "customer"]),
      async (req, res) => {
        try {
          const ticketId = parseInt(req.params.id, 10);
          const ticket = await Tickets.findByPk(ticketId);

          if (!ticket) {
            logger.warn(`Ticket not found for ID: ${ticketId}`);
            return res.status(404).json({ message: "Ticket not found" });
          }

          if (req.user.role !== "admin" && ticket.userId !== req.user.id) {
            logger.warn(`Unauthorized access to ticket ID: ${ticketId}`);
            return res.status(403).json({ message: "Unauthorized Access" });
          }

          logger.info(`Ticket fetched successfully: ${ticketId}`);

          res.json(ticket);
        } catch (error) {
          logger.error(`Error fetching ticket: ${error.message}`);
          res
            .status(500)
            .json({ error: "There was an error fetching the ticket" });
        }
      }
    );

    // PUT /tickets/:id: [Admin, Customer] Update a ticket
    app.put(
      "/tickets/:id",
      limiter,
      validateId("id"),
      validateTicketUpdateParams(),
      authenticateToken(),
      authorization(["admin", "customer"]),
      async (req, res) => {
        try {
          const ticketId = parseInt(req.params.id, 10);
          const ticket = await Tickets.findByPk(ticketId);

          if (!ticket) {
            logger.warn(`Ticket not found for ID: ${ticketId}`);
            return res.status(404).json({ message: "Ticket not found" });
          }

          if (req.user.role !== "admin" && ticket.userId !== req.user.id) {
            logger.warn(`Unauthorized access to ticket ID: ${ticketId}`);
            return res.status(403).json({ message: "Unauthorized Access" });
          }

          const { title, description, status, priority } = req.body;

          await ticket.update({
            title: title || ticket.title,
            description: description || ticket.description,
            status: status || ticket.status,
            priority: priority || ticket.priority,
          });

          logger.info(`Ticket updated successfully: ${ticketId}`);

          res
            .status(200)
            .json({ message: "Ticket successfully updated", ticket });
        } catch (error) {
          logger.error(`Error updating ticket: ${error.message}`);
          res
            .status(500)
            .json({ error: "There was an error updating the ticket" });
        }
      }
    );

    // DELETE /tickets/:id: [Admin, Customer] Delete a ticket
    app.delete(
      "/tickets/:id",
      limiter,
      validateId("id"),
      authenticateToken(),
      authorization(["admin", "customer"]),
      async (req, res) => {
        try {
          const ticketId = parseInt(req.params.id, 10);
          const ticket = await Tickets.findByPk(ticketId);

          if (!ticket) {
            logger.warn(`Ticket not found for deletion: ID ${ticketId}`);
            return res.status(404).json({ message: "Ticket not found" });
          }

          if (req.user.role !== "admin" && ticket.userId !== req.user.id) {
            logger.warn(`Unauthorized access to ticket ID: ${ticketId}`);
            return res.status(403).json({ message: "Unauthorized Access" });
          }

          logger.info(`Ticket successfully deleted: ID ${ticketId}`);

          await ticket.destroy();
          res.status(200).json({ message: "Ticket successfully deleted" });
        } catch (error) {
          res
            .status(500)
            .json({ error: "There was an error deleting the ticket" });
        }
      }
    );

    // Secure HTTPS server
    https.createServer(options, app).listen(port, () => {
      console.log(`Customer Support service running securely on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });
