const { setQueues, BullAdapter } = require('bull-board');
const express = require('express');
const Queue = require('bull');

const app = express();
const testQueue = new Queue('test-queue');

// Set up Bull-Board
setQueues([new BullAdapter(testQueue)]);

// Use the Bull-Board router for the /bull-board path
app.use('/bull-board', require('bull-board').router);

// Add a job route
app.get('/add-job', async (req, res) => {
  await testQueue.add({ message: 'Hello Bull Queue!' });
  res.send('Job added to the queue!');
});

// Queue processing
testQueue.process(async (job) => {
  console.log(`Processing job: ${JSON.stringify(job.data)}`);
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
  console.log('Bull-Board is available at http://localhost:3000/bull-board');
});
