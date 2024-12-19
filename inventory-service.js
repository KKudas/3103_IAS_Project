// Dependencies
const express = require("express");
const https = require("https");
const fs = require("fs");
const { Sequelize } = require("sequelize");
const { sequelize, Inventory } = require("./models/inventorymodel.js");

// Middlewares
const {
  authorization,
  authenticateToken,
} = require("./middleware/authorization.js");
const {
  validateId,
  validateInventoryParams,
  validateInventoryUpdateParams,
} = require("./middleware/sanitation.js");
const limiter = require("./middleware/limiter.js");
const queue = require("./logs/queue.js");
require("./middleware/service-queue.js");
const { logger } = require("./logs/logs.js");

// Load SSL certificates
const options = {
  key: fs.readFileSync("./certs/localhost-key.pem"),
  cert: fs.readFileSync("./certs/localhost-cert.pem"),
};

const app = express();
const port = 4001;
app.use(express.json());

// [ADMIN, MANAGER] POST /add: Add a new product.
app.post(
  "/add",
  limiter,
  authenticateToken(),
  authorization(["admin", "manager"]),
  validateInventoryParams(),
  async (req, res) => {
    try {
      const job = await queue.add("add-product", {
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
      });

      job
        .finished()
        .then((data) => {
          res.status(201).json({ message: "Product successfully added", data });
        })
        .catch((error) => {
          res.status(500).json({
            error: "Error processing new product",
            details: error.message,
          });
        });
    } catch (error) {
      logger.warn(`Error adding new product: ${error.message}`);
      res
        .status(500)
        .json({ error: "There was an error adding a new product" });
    }
  }
);

// [ALL] GET /: Get all products
app.get("/", limiter, async (req, res) => {
  try {
    const products = await Inventory.findAll();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// [ALL] GET /:productId: Get product details by ID.
app.get("/:productId", limiter, validateId("productId"), async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const product = await Inventory.findByPk(productId);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "There was an error fetching the product" });
  }
});

// [CUSTOMER, ADMIN, MANAGER] PUT /:productId: Update a product
app.put(
  "/:productId",
  limiter,
  validateId("productId"),
  authenticateToken(),
  authorization(["admin", "customer", "manager"]),
  validateInventoryUpdateParams(),
  async (req, res) => {
    try {
      const productId = parseInt(req.params.productId, 10);
      const product = await Inventory.findByPk(productId);

      if (!product) {
        logger.warn(`Product not found for ID: ${productId}`);
        return res.status(404).json({ message: "Product not found" });
      }

      if (req.user.role === "customer") {
        logger.warn(`${req.user.id} Updates Product Quantity after order`);
        if (!req.body.quantity) {
          return res
            .status(400)
            .json({ message: "Quantity is required for customers." });
        }

        const invalidFields = Object.keys(req.body).filter(
          (field) => field !== "quantity"
        );
        if (invalidFields.length > 0) {
          logger.warn(`${req.user.id} attempted to update invalid fields`);
          return res.status(400).json({
            message: `Customers are only allowed to update the quantity. Invalid fields: ${invalidFields.join(
              ", "
            )}`,
          });
        }

        await product.update({ quantity: req.body.quantity });

        logger.info(
          `Quantity has been updated after order for product: ${productId}`
        );

        return res.status(200).json({
          message: "Quantity has been updated successfully",
          product,
        });
      }

      await product.update(req.body);
      res.status(200).json({
        message: "Product successfully updated",
        product,
      });

      logger.info(
        `Product successfully updated: ${productId} by ${req.user.id}`
      );
    } catch (error) {
      logger.error(`Error updating product: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  }
);

// [ADMIN, MANAGER] DELETE /:productId: Delete a product
app.delete(
  "/:productId",
  limiter,
  validateId("productId"),
  authenticateToken(),
  authorization(["admin", "manager"]),
  async (req, res) => {
    try {
      const productId = parseInt(req.params.productId, 10);
      const product = await Inventory.findByPk(productId);

      if (!product) {
        logger.warn(`Product not found for deletion: ID ${productId}`);
        return res.status(404).json({ message: "Product not found" });
      }

      await product.destroy();
      res.status(200).json({ message: "Product successfully deleted" });

      logger.info(`Product successfully deleted: ${productId}`);
    } catch (error) {
      logger.error(`Error deleting product: ${error.message}`);
      res
        .status(500)
        .json({ error: "There was an error deleting the product" });
    }
  }
);

https.createServer(options, app).listen(port, () => {
  console.log(`Order service running securely on port ${port}`);
});
