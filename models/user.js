const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

// Connect to the MySQL database
const sequelize = new Sequelize("enterpriseapp", "root", "password", {
  host: "localhost",
  dialect: "mysql",
});

// Test the database connection
sequelize
  .authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Error: " + err));

// Define the User model
const User = sequelize.define(
  "User",
  {
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

    // Check if admin and customer users exist, if not create them
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
  })
  .catch((err) => console.log("Error syncing models: " + err));

module.exports = { sequelize, User };
