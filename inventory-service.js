// Dependencies
const express = require("express");
const https = require("https");
const fs = require("fs");
const { Sequelize } = require("sequelize");
const { sequelize, Inventory } = require("./models/inventory.js");

// Middlewares
const { authorization } = require("./middleware/authorization.js");
const {
  validateId,
  validateInventoryParams,
  validateInventoryUpdateParams,
} = require("./middleware/sanitation.js");
const limiter = require("./middleware/limiter.js");

// Load SSL certificates
const options = {
  key: fs.readFileSync("./certs/localhost-key.pem"),
  cert: fs.readFileSync("./certs/localhost-cert.pem"),
};

const app = express();
const port = 4001;
app.use(express.json());

// POST /add: [Admin] Add a new product.
app.post(
  "/add",
  limiter,
  validateInventoryParams(),
  authorization(["admin"]),
  async (req, res) => {
    try {
      const data = await Inventory.create({
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
      });

      res.status(201).json({ message: "Product successfully added", data });
    } catch (error) {
      res
        .status(500)
        .json({ error: "There was an error adding a new product" });
    }
  }
);

// GET /: [ADMIN, MANAGER] Get all products
app.get("/", limiter, async (req, res) => {
  try {
    const products = await Inventory.findAll();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /:productId: Get product details by ID.
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

// PUT /:productId: [Admin] Update a product
app.put(
  "/:productId",
  limiter,
  validateId("productId"),
  validateInventoryUpdateParams(),
  authorization(["admin"]),
  async (req, res) => {
    try {
      const productId = parseInt(req.params.productId, 10);
      const product = await Inventory.findByPk(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      await product.update(req.body);
      res.status(200).json({
        message: "Product successfully updated",
        product,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// DELETE /:productId: [Admin] Delete a product
app.delete(
  "/:productId",
  limiter,
  validateId("productId"),
  authorization(["admin"]),
  async (req, res) => {
    try {
      const productId = parseInt(req.params.productId, 10);
      const product = await Inventory.findByPk(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      await product.destroy();
      res.status(200).json({ message: "Product successfully deleted" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "There was an error deleting the product" });
    }
  }
);

https.createServer(options, app).listen(port, () => {
  console.log(`Order service running securely on port ${port}`);
});
