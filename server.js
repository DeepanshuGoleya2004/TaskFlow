const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname, 'public')));

// Base Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Task Tracker API is fully operational'
  });
});

// Database Initialization and Server Boot
async function startServer() {
  try {
    // Run DB schema and seeding
    await initDatabase();

    // Start Listening
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`🚀 Task Tracker server is running on port ${PORT}`);
      console.log(`👉 http://localhost:${PORT}`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error('Failed to initialize database and start server:', error);
    process.exit(1);
  }
}

// Export app for testing, boot if run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
