// Dependencies
const express = require("express");
const axios = require("axios");
const https = require("https");
const fs = require("fs");

// Middlewares
const { authorization } = require("./middleware/authorization.js");
const {
  validateId,
  validateOrderParams,
} = require("./middleware/sanitation.js");
const limiter = require("./middleware/limiter.js");

const app = express();
const port = 4003;
app.use(express.json());

// Load SSL certificates
const options = {
  key: fs.readFileSync("./certs/localhost-key.pem"),
  cert: fs.readFileSync("./certs/localhost-cert.pem"),
};

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

let orderId = 1;
let orders = [];

// POST /: [Customer] Create a new order
app.post(
  "/",
  limiter,
  validateOrderParams(),
  authorization(["customer"]),
  async (req, res) => {
    try {
      const productId = parseInt(req.body.productId);

      const productReq = await axios.get(
        `https://localhost:3001/${productId}`,
        {
          httpsAgent,
        }
      );

      const data = {
        orderId: orderId++,
        userId: req.user.id,
        productId: req.body.productId,
        quantity: req.body.quantity,
      };

      orders.push(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// GET /orders/all: [Admin] Get all order list
app.get("/all", limiter, authorization(["admin"]), (req, res) => {
  try {
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /orders/:orderId: [Customer] Get order details.
app.get(
  "/:orderId",
  limiter,
  validateId("orderId"),
  authorization(["customer"]),
  (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId, 10);
      const data = orders.find((order) => order.orderId === orderId);

      if (data) {
        if (data.userId !== req.user.id) {
          return res.status(403).json({ message: "Unauthorized Access" });
        }
        res.json(data);
      } else {
        res.status(404).json({ message: "Order not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// PUT /:orderId: [Customer] Update an order.
app.put(
  "/:orderId",
  limiter,
  validateId("orderId"),
  authorization(["customer"]),
  async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const index = orders.findIndex((order) => {
        return order.orderId === orderId;
      });

      if (index !== -1) {
        const order = orders[index];
        if (order.userId !== req.user.id) {
          return res.status(403).json({ message: "Unauthorized Access" });
        }

        const productId = parseInt(req.body.productId);

        const productReq = await axios.get(
          `https://localhost:3001/${productId}`,
          {
            httpsAgent,
          }
        );

        orders[index] = { ...orders[index], ...req.body };
        res.status(200).json({ message: "Order successfully updated" });
      } else {
        res.status(404).json({ message: "Order not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// DELETE /:orderId: [Customer] Delete an order.
app.delete(
  "/:orderId",
  limiter,
  validateId("orderId"),
  authorization(["customer"]),
  (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const index = orders.findIndex((order) => {
        return order.orderId === orderId;
      });

      if (index !== -1) {
        const order = orders[index];
        if (order.userId !== req.user.id) {
          return res.status(403).json({ message: "Unauthorized Access" });
        }

        orders.splice(index, 1);
        res.status(200).json({ message: "Order successfully deleted" });
      } else {
        res.status(404).json({ message: "Order not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Secure HTTPS server
https.createServer(options, app).listen(port, () => {
  console.log(`Order service running securely on port ${port}`);
});
