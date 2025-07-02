const express = require('express');
const app = express();
const PORT = 4000; // Changed from 3000 to 4000

app.get('/', (req, res) => {
  res.send('Hello from NodeMicroservice-CICD! This is Sainath Namste');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

