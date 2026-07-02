import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bakongRoutes from './routes/bakong';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/bakong', bakongRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Express Server running on port ${PORT}`);
});
