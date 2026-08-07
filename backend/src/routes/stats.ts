import { Router, Request, Response } from 'express';
import { getPgClient } from '../lib/db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pgClient = await getPgClient();

    // 1. Basic counts
    const productsCountQuery = `SELECT count(*) as count FROM "Product" WHERE "isActive" = true`;
    const categoriesCountQuery = `SELECT count(*) as count FROM "Category"`;
    const inquiriesCountQuery = `SELECT count(*) as count FROM "Inquiry"`;
    const ordersCountQuery = `SELECT count(*) as count FROM "Order"`;

    // 2. Revenue and Status Stats
    const revenueQuery = `SELECT SUM("totalAmount") as total FROM "Order" WHERE status NOT IN ('cancelled', 'failed')`;
    const statusQuery = `SELECT status, count(*) as count FROM "Order" GROUP BY status`;
    
    // 3. Revenue by Date (last 30 days)
    const revenueByDateQuery = `
      SELECT DATE("createdAt") as date, SUM("totalAmount") as revenue 
      FROM "Order" 
      WHERE status NOT IN ('cancelled', 'failed') 
        AND "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt") 
      ORDER BY date ASC
    `;

    // 4. Recent Orders
    const recentOrdersQuery = `SELECT * FROM "Order" ORDER BY "createdAt" DESC LIMIT 5`;

    const [
      productsRes,
      categoriesRes,
      inquiriesRes,
      ordersRes,
      revenueRes,
      statusRes,
      revenueByDateRes,
      recentOrdersRes
    ] = await Promise.all([
      pgClient.query(productsCountQuery),
      pgClient.query(categoriesCountQuery),
      pgClient.query(inquiriesCountQuery),
      pgClient.query(ordersCountQuery),
      pgClient.query(revenueQuery),
      pgClient.query(statusQuery),
      pgClient.query(revenueByDateQuery),
      pgClient.query(recentOrdersQuery)
    ]);

    const stats = {
      products: parseInt(productsRes.rows[0]?.count || '0'),
      categories: parseInt(categoriesRes.rows[0]?.count || '0'),
      inquiries: parseInt(inquiriesRes.rows[0]?.count || '0'),
      orders: parseInt(ordersRes.rows[0]?.count || '0'),
      revenue: parseFloat(revenueRes.rows[0]?.total || '0'),
    };

    const statusData = statusRes.rows.map(row => ({
      status: row.status,
      count: parseInt(row.count || '0')
    }));

    const revenueData = revenueByDateRes.rows.map(row => ({
      // Format date nicely (e.g. "Aug 7")
      date: new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: parseFloat(row.revenue || '0')
    }));

    res.json({
      stats,
      statusData,
      revenueData,
      recentOrders: recentOrdersRes.rows
    });
  } catch (err: any) {
    console.error("Stats Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
