import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
// @ts-ignore
import xss from 'xss-clean';
// @ts-ignore
import hpp from 'hpp';
import bakongRoutes from './routes/bakong';
import adminRoutes from './routes/admin';
import ordersRoutes from './routes/orders';
import crudRoutes from './routes/crud';
import publicRoutes from './routes/public';
import readRoutes from './routes/read';
import statsRoutes from './routes/stats';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

app.use(compression());

app.use(morgan('dev'));

const allowedOrigins = [
  'http://localhost:3000', 
  'http://127.0.0.1:3000',
  'https://ysg-group.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(xss());

app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: { error: "Too many requests, please try again later." },
  skip: (req) => req.originalUrl === '/api/bakong/check-status'
});
app.use('/api/', limiter);

// Strict Rate Limiting for Public Form Submissions to prevent Spam & Bot Injections
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // max 15 submissions per 15 mins per IP
  message: { error: "Too many form submissions, please try again in a few minutes." }
});
app.use('/api/public/contact', formLimiter);
app.use('/api/public/inquiry', formLimiter);

app.use('/api/admin', adminRoutes);
app.use('/api/admin/crud', crudRoutes);
app.use('/api/admin/read', readRoutes);
app.use('/api/admin/stats', statsRoutes);
app.use('/api/bakong', bakongRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/public', publicRoutes);

import { getPgClient } from './lib/db';

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

const initializeDatabase = async () => {
  try {
    const pgClient = await getPgClient();
    try {
      await pgClient.query(`
        CREATE TABLE IF NOT EXISTS "Setting" (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value TEXT,
          "updatedAt" TIMESTAMP DEFAULT NOW()
        )
      `);
      await pgClient.query(`
        ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "bakongMd5" TEXT;
      `);
      console.log('✅ Database tables and schema verified.');
    } finally {
      await pgClient.release();
    }
  } catch (error) {
    console.error('❌ Failed to initialize database tables:', error);
  }
};

app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`🚀 Express Server running on port ${PORT}`);
});

// ─── Auto-Cleanup: Delete orders & audit logs older than 30 days ──────────────
const runOrderCleanup = async () => {
  try {
    const pgClient = await getPgClient();
    try {
      // Delete old Orders
      const orderResult = await pgClient.query(`
        DELETE FROM "Order"
        WHERE "createdAt" < NOW() - INTERVAL '30 days'
      `);
      const deletedOrders = orderResult.rowCount ?? 0;

      // Delete old Audit Logs
      const auditResult = await pgClient.query(`
        DELETE FROM "audit_logs"
        WHERE created_at < NOW() - INTERVAL '30 days'
      `);
      const deletedAudit = auditResult.rowCount ?? 0;

      console.log(`🗑️  Auto-cleanup: Deleted ${deletedOrders} order(s) and ${deletedAudit} audit log(s) older than 30 days.`);
    } finally {
      await pgClient.release();
    }
  } catch (error) {
    console.error('❌ Auto-cleanup failed:', error);
  }
};

// Run once on startup, then every 24 hours
runOrderCleanup();
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
setInterval(runOrderCleanup, TWENTY_FOUR_HOURS);

