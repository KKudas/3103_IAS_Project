// Dependencies
const express = require("express");
const https = require("https");
const fs = require("fs");

// Middlewares
const { authorization } = require("./middleware/authorization.js");
const {
  validateId,
  validateProductParams,
} = require("./middleware/sanitation.js");
const limiter = require("./middleware/limiter.js");

// Load SSL certificates
const options = {
  key: fs.readFileSync("./certs/localhost-key.pem"),
  cert: fs.readFileSync("./certs/localhost-cert.pem"),
};

const app = express();
const port = 3001;
app.use(express.json());

let productId = 1;
let products = [];

// POST /: [Admin] Add a new product.
app.post(
  "/",
  limiter,
  validateProductParams(),
  authorization(["admin"]),
  (req, res) => {
    try {
      const data = {
        productId: productId++,
        prodName: req.body.prodName,
        prodPrice: req.body.prodPrice,
      };
      products.push(data);
      res.status(201).json(data);
    } catch (error) {
      res
        .status(500)
        .json({ error: "There was an error adding a new product" });
    }
  }
);

// GET /all: Get all products
app.get("/all", limiter, (req, res) => {
  try {
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /:productId: Get product details by ID.
app.get("/:productId", limiter, validateId("productId"), (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const item = products.find((product) => product.productId === productId);

    if (item) {
      res.json(item);
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
  authorization(["admin"]),
  (req, res) => {
    try {
      const productId = parseInt(req.params.productId, 10);
      const index = products.findIndex((product) => {
        return product.productId === productId;
      });

      if (index !== -1) {
        products[index] = { ...products[index], ...req.body };
        res.status(200).json({ message: "Product successfully updated" });
      } else {
        res
          .status(500)
          .json({ error: "There was an error updating the product" });
      }
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
  (req, res) => {
    try {
      const productId = parseInt(req.params.productId, 10);
      const index = products.findIndex((product) => {
        return product.productId === productId;
      });

      if (index !== -1) {
        products.splice(index, 1);
        res.status(200).json({ message: "Product successfully deleted" });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: "There was an error deleting the product" });
    }
  }
);

// Secure HTTPS server
https.createServer(options, app).listen(port, () => {
  console.log(`Order service running securely on port ${port}`);
});
