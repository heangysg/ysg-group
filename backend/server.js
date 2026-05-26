const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss-clean');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Security Headers (Helmet)
// This adds 14+ different HTTP headers to protect against common attacks
app.use(helmet());

const allowedOrigins = ['http://localhost:3000', 'https://ysg-group.vercel.app'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS security'));
    }
  },
  credentials: true,
}));

// 3. Request Rate Limiting (DDoS Protection)
// Limit each IP to 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Apply the rate limiting middleware to all requests
app.use(limiter);

// 4. Body Parser & Data Sanitization
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent payload DOS attacks

// 5. Data Sanitization against XSS
app.use(xss());

// 6. Prevent HTTP Parameter Pollution
app.use(hpp());

// Logging
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