const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("./db");

// Define the User model
const Inventory = sequelize.define(
  "Inventory",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

sequelize.sync({ force: false }).then(() => {
  console.log("Inventory table created or already exists");

  const dummyData = [
    {
      name: "Product A",
      price: 19.99,
      quantity: 100,
    },
    {
      name: "Product B",
      price: 29.99,
      quantity: 150,
    },
    {
      name: "Product C",
      price: 39.99,
      quantity: 200,
    },
  ];

  dummyData.forEach(async (product) => {
    try {
      const existingProduct = await Inventory.findOne({
        where: { name: product.name },
      });

      if (existingProduct) {
        console.log(
          `${product.name} already exists in the inventory. Skipping insertion.`
        );
      } else {
        await Inventory.create(product);
        console.log(`${product.name} has been added to the inventory.`);
      }
    } catch (error) {
      console.error(`Error processing ${product.name}: `, error);
    }
  });
});

module.exports = { sequelize, Inventory };
