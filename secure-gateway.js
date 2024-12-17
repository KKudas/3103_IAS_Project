const express = require("express");
const https = require("https");
const fs = require("fs");
const mysql = require("mysql2");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // your database username
  password: "@localhost123", // your database password
  database: "enterpriseapp", // the database you want to connect to
  port: 3306, // the port your database is running on, default is 3306
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
const productServiceProxy = createProxyMiddleware({
  target: "https://localhost:4001", // URL of the product service
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

// Routes
app.use("/products", productServiceProxy);
app.use("/orders", orderServiceProxy);
app.use("/users", userServiceProxy);

https.createServer(options, app).listen(8080, () => {
  console.log("gateway started on port 8080");
});
