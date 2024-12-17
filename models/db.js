// Connect to the MySQL database
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("enterpriseapp", "root", "password", {
  host: "localhost",
  dialect: "mysql",
});

sequelize
  .authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Error: " + err));
  
module.exports = sequelize;
