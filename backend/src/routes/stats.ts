import { Router, Response } from 'express';
import { getPgClient } from '../lib/db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  let pgClient;
  try {
    pgClient = await getPgClient();

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

    // 5. Monthly Revenue (last 12 months)
    const monthlyRevenueQuery = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') as label,
        SUM("totalAmount") as revenue,
        COUNT(*) as orders
      FROM "Order"
      WHERE status NOT IN ('cancelled', 'failed')
        AND "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    // 6. Stock Summary
    const stockQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE "isPublished" = true) as published,
        COUNT(*) FILTER (WHERE "isPublished" = false) as hidden,
        COUNT(*) FILTER (WHERE "isFeatured" = true) as featured
      FROM "Product" WHERE "isActive" = true
    `;

    // 7. Top Products (by how many orders reference them by name search)
    const topProductsQuery = `
      SELECT 
        p.id,
        p.name,
        p."nameKhmer",
        p.price,
        p."categoryId",
        COUNT(o.id) as order_count,
        SUM(o."totalAmount") as total_revenue
      FROM "Product" p
      LEFT JOIN "Order" o ON o."items"::text LIKE '%' || p.id::text || '%'
        AND o.status NOT IN ('cancelled', 'failed')
      WHERE p."isActive" = true
      GROUP BY p.id, p.name, p."nameKhmer", p.price, p."categoryId"
      ORDER BY order_count DESC, p."createdAt" DESC
      LIMIT 10
    `;

    // 8. Yearly Revenue
    const yearlyRevenueQuery = `
      SELECT 
        EXTRACT(YEAR FROM "createdAt") as year,
        SUM("totalAmount") as revenue,
        COUNT(*) as orders
      FROM "Order"
      WHERE status NOT IN ('cancelled', 'failed')
      GROUP BY EXTRACT(YEAR FROM "createdAt")
      ORDER BY year DESC
      LIMIT 5
    `;

    const [
      productsRes,
      categoriesRes,
      inquiriesRes,
      ordersRes,
      revenueRes,
      statusRes,
      revenueByDateRes,
      recentOrdersRes,
      monthlyRevenueRes,
      stockRes,
      topProductsRes,
      yearlyRevenueRes
    ] = await Promise.all([
      pgClient.query(productsCountQuery),
      pgClient.query(categoriesCountQuery),
      pgClient.query(inquiriesCountQuery),
      pgClient.query(ordersCountQuery),
      pgClient.query(revenueQuery),
      pgClient.query(statusQuery),
      pgClient.query(revenueByDateQuery),
      pgClient.query(recentOrdersQuery),
      pgClient.query(monthlyRevenueQuery),
      pgClient.query(stockQuery),
      pgClient.query(topProductsQuery),
      pgClient.query(yearlyRevenueQuery),
    ]);

    const stats = {
      products: parseInt(productsRes.rows[0]?.count || '0'),
      categories: parseInt(categoriesRes.rows[0]?.count || '0'),
      inquiries: parseInt(inquiriesRes.rows[0]?.count || '0'),
      orders: parseInt(ordersRes.rows[0]?.count || '0'),
      revenue: parseFloat(revenueRes.rows[0]?.total || '0'),
    };

    const statusData = statusRes.rows.map((row: any) => ({
      status: row.status,
      count: parseInt(row.count || '0')
    }));

    const revenueData = revenueByDateRes.rows.map((row: any) => ({
      date: new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: parseFloat(row.revenue || '0')
    }));

    const monthlyRevenue = monthlyRevenueRes.rows.map((row: any) => ({
      month: row.month,
      label: row.label,
      revenue: parseFloat(row.revenue || '0'),
      orders: parseInt(row.orders || '0')
    }));

    const stock = stockRes.rows[0] ? {
      total: parseInt(stockRes.rows[0].total || '0'),
      published: parseInt(stockRes.rows[0].published || '0'),
      hidden: parseInt(stockRes.rows[0].hidden || '0'),
      featured: parseInt(stockRes.rows[0].featured || '0'),
    } : { total: 0, published: 0, hidden: 0, featured: 0 };

    const topProducts = topProductsRes.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      nameKhmer: row.nameKhmer,
      price: parseFloat(row.price || '0'),
      orderCount: parseInt(row.order_count || '0'),
      totalRevenue: parseFloat(row.total_revenue || '0')
    }));

    const yearlyRevenue = yearlyRevenueRes.rows.map((row: any) => ({
      year: parseInt(row.year),
      revenue: parseFloat(row.revenue || '0'),
      orders: parseInt(row.orders || '0'),
    }));

    res.json({
      stats,
      statusData,
      revenueData,
      recentOrders: recentOrdersRes.rows,
      monthlyRevenue,
      stock,
      topProducts,
      yearlyRevenue,
    });
  } catch (err: any) {
    console.error("Stats Error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (pgClient) await pgClient.release();
  }
});

export default router;
