require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { initDatabase } = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Security Headers
app.use(helmet());

// Configure CORS
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request Logger
app.use(morgan('dev'));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads if needed (default backend structure)
app.use('/uploads', express.static('uploads'));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date() });
});

// Register API Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api', require('./src/routes/api'));

// Express Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Exception:', err);
  res.status(500).json({ error: 'An unexpected backend error occurred.' });
});

// Start Database and Express Server
async function startServer() {
  try {
    // Connect to database and seed data
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`Zenith MERN Server is active on port: ${PORT}`);
      console.log(`CORS allows origins from client: ${clientUrl}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('❌ Failed to start MERN backend server:', error.message);
    process.exit(1);
  }
}

startServer();
