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

      res.json({ message: "Oder successfully placed", data });
    } catch (error) {
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
        return res.status(404).json({ message: "No orders found" });
      }

      res.json(orders);
    } catch (error) {
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
        return res.status(404).json({ message: "Order not found" });
      }

      if (
        order.user_id !== req.user.id ||
        req.user.role === "admin" ||
        req.user.role === "support"
      ) {
        return res.status(403).json({ message: "Unauthorized Access" });
      }

      res.json(order);
    } catch (error) {
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
        return res.status(404).json({ message: "Order not found" });
      }

      const { status } = req.body;
      const invalidFields = Object.keys(req.body).filter(
        (key) => key !== "status"
      );

      if (invalidFields.length > 0) {
        return res.status(400).json({
          message: `Invalid fields detected: ${invalidFields.join(", ")}`,
        });
      }

      if (!status || !["pending", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({
          message:
            "Status must be one of: 'pending', 'completed', or 'cancelled'",
        });
      }

      await order.update({ status });

      res.status(200).json({
        message: "Order status successfully updated",
        data: order,
      });
    } catch (error) {
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
      const order = Order.findByPk(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      await order.destroy();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

https.createServer(options, app).listen(port, () => {
  console.log(`Order service running securely on port ${port}`);
});
