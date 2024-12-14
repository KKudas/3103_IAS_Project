const express = require("express");
const https = require("https");
const fs = require("fs");

const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Loading SSL certificate
const options = {
  key: fs.readFileSync("./certs/localhost-key.pem"),
  cert: fs.readFileSync("./certs/localhost-cert.pem"),
};

// Proxy options for microservices
const productServiceProxy = createProxyMiddleware({
  target: "https://localhost:3001", // URL of the product service
  changeOrigin: true,
  secure: false,
});

const userServiceProxy = createProxyMiddleware({
  target: "https://localhost:3002", // URL of the user service
  changeOrigin: true,
  secure: false,
});

const orderServiceProxy = createProxyMiddleware({
  target: "https://localhost:3003", // URL of the order service
  changeOrigin: true,
  secure: false,
});

const oauth2ServiceProxy = createProxyMiddleware({
  target: "https://localhost:3004", // URL of the provider service
  changeOrigin: true,
  secure: false,
});

// Routes
app.use("/products", productServiceProxy);
app.use("/orders", orderServiceProxy);
app.use("/users", userServiceProxy);
app.use("/auth", oauth2ServiceProxy);

https.createServer(options, app).listen(8080, () => {
  console.log("gateway started on port 8080");
});

