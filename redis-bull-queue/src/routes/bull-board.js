const { createBullBoard } = require('@bull-board/api');
const { ExpressAdapter } = require('@bull-board/express');
const Bull = require('bull');
const { BullAdapter } = require('@bull-board/api');  // Import BullAdapter correctly

const express = require('express');
const app = express();

// Create a queue
const myQueue = new Bull('myQueue');

// Create the server adapter for Bull-Board
const serverAdapter = new ExpressAdapter();

// Set up Bull Board (do not use `new` for BullAdapter)
createBullBoard({
  queues: [BullAdapter(myQueue)],  // Use BullAdapter as a function, not a constructor
  serverAdapter,
});

// Set the base path for Bull-Board UI
serverAdapter.setBasePath('/bull-board');

// Register the Bull-Board router
app.use('/bull-board', serverAdapter.getRouter());

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});