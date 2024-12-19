// Dependencies
const express = require("express");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const https = require("https");
const fs = require("fs");
const cors = require("cors");
const { Sequelize } = require("sequelize");
const axios = require("axios");

const { sequelize, Order } = require("./models/ordermodel.js");
require("dotenv").config({ path: "../../.env" });

// Middleware
const {
  authenticateToken,
  authorization,
} = require("./middleware/authorization.js");
const {
  validateId,
  validateOrderParams,
  validateOrderUpdateParams,
} = require("./middleware/sanitation.js");
const limiter = require("./middleware/limiter.js");
const path = require("path");
const queue = require("./logs/queue.js");
require("./middleware/service-queue.js");
const { logger } = require("./logs/logs.js");

// Load SSL certificates
const options = {
  key: fs.readFileSync("./certs/localhost-key.pem"),
  cert: fs.readFileSync("./certs/localhost-cert.pem"),
};

// Environment Variables
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
const port = 4003;
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

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// [CUSTOMER] POST /orders/add: Create a new order
app.post(
  "/add",
  limiter,
  validateOrderParams(),
  authenticateToken(),
  authorization(["customer"]),
  async (req, res) => {
    try {
      const product_id = parseInt(req.body.product_id);
      const quantity = parseInt(req.body.quantity);

      const productReq = await axios.get(
        `https://localhost:4001/${product_id}`,
        {
          httpsAgent,
        }
      );

      if (quantity > productReq.data.quantity) {
        logger.warn(
          `Insufficient stock. Only ${productReq.data.quantity} units are available. User attempted to order ${quantity} units for product ID: ${product_id}`
        );
        return res.status(400).json({
          message: `Insufficient stock. Only ${productReq.data.quantity} units are available.`,
        });
      }

      const data = await Order.create({
        user_id: req.user.id,
        product_id: req.body.product_id,
        quantity: req.body.quantity,
        price: productReq.data.price,
        total_price:
          Math.round(req.body.quantity * productReq.data.price * 100) / 100,
      });

      const updatedQuantity = productReq.data.quantity - req.body.quantity;

      const productUpdateResponse = await axios.put(
        `https://localhost:4001/${product_id}`,
        { quantity: updatedQuantity },
        {
          headers: {
            Authorization: `Bearer ${
              req.headers["authorization"]?.split(" ")[1]
            }`, // Pass the same JWT token here
          },
          httpsAgent,
        }
      );

      logger.info(`Order successfully placed for user ID: ${req.user.id}`);

      res.json({ message: "Oder successfully placed", data });
    } catch (error) {
      logger.error(`Error placing order: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  }
);

// [ADMIN, SUPPORT] GET /all: Get all order list
app.get(
  "/all",
  limiter,
  authenticateToken(),
  authorization(["admin", "support"]),
  async (req, res) => {
    try {
      logger.info(`Admin/Suport user ID: ${req.user.id} fetched all orders`);
      const orders = await Order.findAll();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// [CUSTOMER, ADMIN, SUPPORT] GET /orders: Get all orders for a user
app.get(
  "/",
  limiter,
  authenticateToken(),
  authorization(["customer", "admin", "support"]),
  async (req, res) => {
    try {
      const orders = await Order.findAll({
        where: {
          user_id: req.user.id,
        },
      });

      if (orders.length === 0) {
        logger.warn(`No orders found for user ID: ${req.user.id}`);
        return res.status(404).json({ message: "No orders found" });
      }

      logger.info(`User ID: ${req.user.id} fetched all orders`);
      res.json(orders);
    } catch (error) {
      logger.error(`Error fetching orders: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  }
);

// [CUSTOMER, ADMIN, SUPPORT] GET /orders/:orderId: Get order details.
app.get(
  "/:orderId",
  limiter,
  validateId("orderId"),
  authenticateToken(),
  async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId, 10);
      const order = await Order.findByPk(orderId);

      if (!order) {
        logger.warn(`Order not found for ID: ${orderId}`);
        return res.status(404).json({ message: "Order not found" });
      }

      if (
        order.user_id !== req.user.id ||
        req.user.role === "admin" ||
        req.user.role === "support"
      ) {
        logger.warn(
          `Unauthorized access. User ID: ${req.user.id} attempted to access order ID: ${orderId}`
        );
        return res.status(403).json({ message: "Unauthorized Access" });
      }

      logger.info(`Order fetched successfully: ${orderId}`);
      res.json(order);
    } catch (error) {
      logger.error(`Error fetching order: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  }
);

// [ADMIN, SUPPORT, MANAGER] PUT /:orderId: Update an order. Only status
app.put(
  "/:orderId",
  limiter,
  validateId("orderId"),
  validateOrderUpdateParams(),
  authenticateToken(),
  authorization(["admin", "support", "manager"]),
  async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await Order.findByPk(orderId);

      if (!order) {
        logger.warn(`Order not found for ID: ${orderId}`);
        return res.status(404).json({ message: "Order not found" });
      }

      const { status } = req.body;
      const invalidFields = Object.keys(req.body).filter(
        (key) => key !== "status"
      );

      if (invalidFields.length > 0) {
        logger.warn(`Invalid fields detected: ${invalidFields.join(", ")}`);
        return res.status(400).json({
          message: `Invalid fields detected: ${invalidFields.join(", ")}`,
        });
      }

      if (!status || !["pending", "completed", "cancelled"].includes(status)) {
        logger.warn(
          `Invalid status: ${status}. Must be one of: 'pending', 'completed', or 'cancelled'`
        );
        return res.status(400).json({
          message:
            "Status must be one of: 'pending', 'completed', or 'cancelled'",
        });
      }

      logger.info(`Order status updated for order ID: ${orderId}`);
      await order.update({ status });

      res.status(200).json({
        message: "Order status successfully updated",
        data: order,
      });
    } catch (error) {
      logger.error(`Error updating order: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  }
);

// [ADMIN] DELETE /:orderId: Delete an order.
app.delete(
  "/:orderId",
  limiter,
  validateId("orderId"),
  authorization(["admin"]),
  async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await Order.findByPk(orderId);

      if (!order) {
        logger.warn(`Order not found for deletion: ID ${orderId}`);
        return res.status(404).json({ message: "Order not found" });
      }

      logger.info(`Order successfully deleted: ID ${orderId}`);
      await order.destroy();
      res.status(200).json({ message: "Order successfully deleted" });
    } catch (error) {
      logger.error(`Error deleting order: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  }
);

https.createServer(options, app).listen(port, () => {
  console.log(`Order service running securely on port ${port}`);
});
