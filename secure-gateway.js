const express = require("express");
const https = require("https");
const fs = require("fs");
const mysql = require("mysql2");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // database password
  database: "enterpriseapp", // database name
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  }
  console.log("Connected to the MySQL database.");
});

// Loading SSL certificate
const options = {
  key: fs.readFileSync("./certs/localhost-key.pem"),
  cert: fs.readFileSync("./certs/localhost-cert.pem"),
};

// Proxy options for microservices convert to inventory
const inventoryServiceProxy = createProxyMiddleware({
  target: "https://localhost:4001", // URL of the inventory service
  changeOrigin: true,
  secure: false,
});

const userServiceProxy = createProxyMiddleware({
  target: "https://localhost:4002", // URL of the user service
  changeOrigin: true,
  secure: false,
});

const orderServiceProxy = createProxyMiddleware({
  target: "https://localhost:4003", // URL of the order service
  changeOrigin: true,
  secure: false,
});

const customerSupportServiceProxy = createProxyMiddleware({
  target: "https://localhost:4004", // URL of the order service
  changeOrigin: true,
  secure: false,
});

// Routes
app.use("/inventory", inventoryServiceProxy);
app.use("/orders", orderServiceProxy);
app.use("/users", userServiceProxy);
app.use("/support", customerSupportServiceProxy);

https.createServer(options, app).listen(8080, () => {
  console.log("gateway started on port 8080");
});
