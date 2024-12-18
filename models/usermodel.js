const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const sequelize = require("./db");

// Define the User model
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    github_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "customer", // default role
    },
  },
  {
    timestamps: false,
  }
);

// Sync all models to the database
sequelize
  .sync({ force: false })
  .then(async () => {
    console.log("User table created or already exists");

    const adminExists = await User.findOne({ where: { username: "admin" } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        username: "admin",
        email: "admin@admin.com",
        password: hashedPassword,
        role: "admin",
      });
      console.log("Admin user created");
    }

    const customerExists = await User.findOne({
      where: { username: "customer" },
    });
    if (!customerExists) {
      const hashedPassword = await bcrypt.hash("customer123", 10);
      await User.create({
        username: "customer",
        email: "customer@customer.com",
        password: hashedPassword,
        role: "customer",
      });
      console.log("Customer user created");
    }

    const managerExists = await User.findOne({
      where: { username: "manager" },
    });
    if (!managerExists) {
      const hashedPassword = await bcrypt.hash("manager123", 10);
      await User.create({
        username: "manager",
        email: "manager@manager.com",
        password: hashedPassword,
        role: "manager",
      });
      console.log("Manager user created");
    }

    const supportExists = await User.findOne({
      where: { username: "support" },
    });
    if (!supportExists) {
      const hashedPassword = await bcrypt.hash("support123", 10);
      await User.create({
        username: "support",
        email: "support@support.com",
        password: hashedPassword,
        role: "support",
      });
      console.log("Support user created");
    }
  })

  
  .catch((err) => console.log("Error syncing models: " + err));

module.exports = { sequelize, User };
