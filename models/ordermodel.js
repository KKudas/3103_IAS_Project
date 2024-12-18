const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("./db.js");
const { User } = require("./usermodel.js");

// Define the Order model
const Order = sequelize.define(
  "Order",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "cancelled"),
      defaultValue: "pending",
    },
  },
  {
    timestamps: false,
  }
);

sequelize.sync({ force: false }).then(() => {
  console.log("User and Order tables created or already exist");
});

module.exports = { sequelize, Order };
