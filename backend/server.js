const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/admin', adminRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({ 
    message: "YSG Machinery API is running...",
    version: "1.1.0",
    status: "Healthy"
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`
  🚀 Server is running!
  📡 URL: http://localhost:${PORT}
  🛠️ Environment: ${process.env.NODE_ENV || 'development'}
  `);
});