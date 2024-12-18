const express = require('express');
const app = express();
const bullBoardRoutes = require('./src/routes/bull-board');

// Use the Bull-Board routes
app.use(bullBoardRoutes);

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
