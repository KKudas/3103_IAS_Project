const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("./db");

// Define the Tickets model
const Tickets = sequelize.define(
  "Tickets",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Open", // Possible values: Open, In Progress, Closed
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Medium", // Possible values: Low, Medium, High
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    timestamps: false,
  }
);

sequelize.sync({ force: false }).then(() => {
  console.log("Tickets table created or already exists");

  // Dummy data for Tickets
  const dummyTickets = [
    {
      title: "Cannot access account",
      description: "I'm unable to log into my account with my credentials.",
      status: "Open",
      priority: "High",
      userId: 1,
    },
    {
      title: "Error on checkout",
      description: "Encountered an error while trying to complete my purchase.",
      status: "In Progress",
      priority: "Medium",
      userId: 2,
    },
    {
      title: "Feature request: Dark mode",
      description: "It would be great to have a dark mode option in the settings.",
      status: "Closed",
      priority: "Low",
      userId: 1,
    },
  ];

  dummyTickets.forEach(async (ticket) => {
    try {
      const existingTicket = await Tickets.findOne({
        where: { title: ticket.title },
      });

      if (existingTicket) {
        console.log(
          `${ticket.title} already exists in the tickets. Skipping insertion.`
        );
      } else {
        await Tickets.create(ticket);
        console.log(`${ticket.title} has been added to the tickets.`);
      }
    } catch (error) {
      console.error(`Error processing ${ticket.title}: `, error);
    }
  });
});

module.exports = { sequelize, Tickets };