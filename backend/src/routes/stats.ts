import { Router, Response } from 'express';
import { getPgClient } from '../lib/db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

type StatsRange = '7d' | '30d' | '90d' | '12m' | 'all';

const RANGE_INTERVALS: Record<Exclude<StatsRange, 'all'>, { current: string; previous: string; days: number }> = {
  '7d': { current: '7 days', previous: '14 days', days: 6 },
  '30d': { current: '30 days', previous: '60 days', days: 29 },
  '90d': { current: '90 days', previous: '180 days', days: 89 },
  '12m': { current: '12 months', previous: '24 months', days: 364 },
};

const PAID_STATUS_FILTER = `LOWER(COALESCE(status, '')) IN ('paid', 'confirmed', 'shipping', 'completed')`;

function normalizeRange(raw: unknown): StatsRange {
  if (raw === '7d' || raw === '30d' || raw === '90d' || raw === '12m' || raw === 'all') {
    return raw;
  }
  return '30d';
}

function calcGrowth(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? 100 : null;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

router.post('/', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  let pgClient;
  try {
    if (req.user?.roleName === 'STAFF' && !req.user?.isSuperAdmin) {
      res.status(403).json({ error: 'Access denied: Staff accounts cannot view reports or revenue dashboard.' });
      return;
    }

    const range = normalizeRange(req.body?.range);
    const intervalCfg = range === 'all' ? null : RANGE_INTERVALS[range];
    const currentDateWhere = intervalCfg ? `AND "createdAt" >= NOW() - INTERVAL '${intervalCfg.current}'` : '';
    const prevDateWhere = intervalCfg
      ? `AND "createdAt" >= NOW() - INTERVAL '${intervalCfg.previous}' AND "createdAt" < NOW() - INTERVAL '${intervalCfg.current}'`
      : 'AND FALSE';

    pgClient = await getPgClient();

    // 1. Catalog & Inquiry counts
    const productsCountQuery = `SELECT COUNT(*) as count FROM "Product" WHERE "isActive" = true`;
    const categoriesCountQuery = `SELECT COUNT(*) as count FROM "Category"`;
    const inquiriesCountQuery = `SELECT COUNT(*) as count FROM "Inquiry"`;

    // 2. Revenue, Paid Orders, AOV, and Previous Period Comparison
    const summaryQuery = `
      SELECT
        COALESCE(SUM("totalAmount") FILTER (WHERE ${PAID_STATUS_FILTER} ${currentDateWhere}), 0) AS revenue,
        COUNT(*) FILTER (WHERE ${PAID_STATUS_FILTER} ${currentDateWhere}) AS paid_orders,
        COALESCE(SUM("totalAmount") FILTER (WHERE ${PAID_STATUS_FILTER} ${prevDateWhere}), 0) AS prev_revenue,
        COUNT(*) FILTER (WHERE ${PAID_STATUS_FILTER} ${prevDateWhere}) AS prev_paid_orders,
        COALESCE(SUM("totalAmount") FILTER (WHERE ${PAID_STATUS_FILTER}), 0) AS all_time_revenue,
        COUNT(*) FILTER (WHERE ${PAID_STATUS_FILTER}) AS all_time_paid_orders,
        COUNT(*) FILTER (WHERE LOWER(COALESCE(status, 'pending')) = 'pending' ${currentDateWhere}) AS pending_orders,
        COUNT(*) FILTER (WHERE LOWER(COALESCE(status, '')) IN ('cancelled', 'failed') ${currentDateWhere}) AS cancelled_orders
      FROM "Order"
    `;

    // 3. Order Status breakdown (for current range)
    const statusQuery = `
      SELECT LOWER(COALESCE(status, 'pending')) AS status, COUNT(*) AS count
      FROM "Order"
      WHERE TRUE ${currentDateWhere}
      GROUP BY LOWER(COALESCE(status, 'pending'))
      ORDER BY count DESC
    `;

    // 4. Time-series revenue chart (gap-free daily for 7d/30d/90d, monthly for 12m/all)
    const dailySeriesDays = intervalCfg && range !== '12m' ? intervalCfg.days : 29;
    const revenueByDateQuery = `
      WITH days AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '${dailySeriesDays} days',
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date AS day
      ),
      agg AS (
        SELECT
          DATE("createdAt") AS day,
          SUM("totalAmount") AS revenue,
          COUNT(*) AS orders
        FROM "Order"
        WHERE ${PAID_STATUS_FILTER}
          AND DATE("createdAt") >= CURRENT_DATE - INTERVAL '${dailySeriesDays} days'
        GROUP BY DATE("createdAt")
      )
      SELECT
        d.day AS date,
        COALESCE(a.revenue, 0) AS revenue,
        COALESCE(a.orders, 0) AS orders
      FROM days d
      LEFT JOIN agg a ON a.day = d.day
      ORDER BY d.day ASC
    `;

    // 5. Monthly Revenue (gap-free last 12 months)
    const monthlyRevenueQuery = `
      WITH months AS (
        SELECT generate_series(
          DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months',
          DATE_TRUNC('month', CURRENT_DATE),
          INTERVAL '1 month'
        ) AS m
      ),
      agg AS (
        SELECT
          DATE_TRUNC('month', "createdAt") AS m,
          SUM("totalAmount") AS revenue,
          COUNT(*) AS orders
        FROM "Order"
        WHERE ${PAID_STATUS_FILTER}
          AND "createdAt" >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
      )
      SELECT
        TO_CHAR(months.m, 'YYYY-MM') AS month,
        TO_CHAR(months.m, 'Mon YYYY') AS label,
        COALESCE(agg.revenue, 0) AS revenue,
        COALESCE(agg.orders, 0) AS orders
      FROM months
      LEFT JOIN agg ON agg.m = months.m
      ORDER BY months.m ASC
    `;

    // 6. Recent Orders (exclude unpaid pending checkouts so this aligns with /admin/orders)
    const recentOrdersQuery = `
      SELECT *
      FROM "Order"
      WHERE LOWER(COALESCE(status, 'pending')) != 'pending'
      ORDER BY "createdAt" DESC
      LIMIT 6
    `;

    // 7. Real Inventory Stock Summary & Low Stock Alerts
    const stockQuery = `
      SELECT
        COUNT(*) AS total_products,
        COALESCE(SUM(GREATEST(stock, 0)), 0) AS total_units,
        COALESCE(SUM(COALESCE(price, 0) * GREATEST(stock, 0)), 0) AS inventory_value,
        COUNT(*) FILTER (WHERE stock > 5) AS in_stock,
        COUNT(*) FILTER (WHERE stock > 0 AND stock <= 5) AS low_stock,
        COUNT(*) FILTER (WHERE stock <= 0) AS out_of_stock,
        COUNT(*) FILTER (WHERE "isPublished" = true) AS published,
        COUNT(*) FILTER (WHERE "isPublished" = false) AS hidden,
        COUNT(*) FILTER (WHERE "isFeatured" = true) AS featured
      FROM "Product"
      WHERE "isActive" = true
    `;

    const lowStockProductsQuery = `
      SELECT id, slug, name, "nameKhmer", sku, stock, price
      FROM "Product"
      WHERE "isActive" = true AND stock <= 5
      ORDER BY stock ASC, "updatedAt" DESC
      LIMIT 8
    `;

    // 8. Accurate Top Selling Products (parsed from Order.items JSONB: unit price * qty)
    const topProductsQuery = `
      WITH paid_items AS (
        SELECT
          o.id AS order_id,
          item->>'id' AS item_id,
          item->>'slug' AS item_slug,
          GREATEST(COALESCE(NULLIF(item->>'quantity', '')::numeric, 1), 1) AS qty,
          COALESCE(NULLIF(item->>'price', '')::numeric, 0) AS unit_price
        FROM "Order" o
        CROSS JOIN LATERAL jsonb_array_elements(o.items::jsonb) AS item
        WHERE ${PAID_STATUS_FILTER}
          ${currentDateWhere}
          AND jsonb_typeof(o.items::jsonb) = 'array'
      )
      SELECT
        p.id,
        p.slug,
        p.name,
        p."nameKhmer",
        p.price,
        p.stock,
        COUNT(DISTINCT pi.order_id) AS order_count,
        COALESCE(SUM(pi.qty), 0) AS units_sold,
        COALESCE(SUM(pi.qty * pi.unit_price), 0) AS total_revenue
      FROM "Product" p
      INNER JOIN paid_items pi
        ON (pi.item_id IS NOT NULL AND pi.item_id = p.id::text)
        OR (pi.item_slug IS NOT NULL AND pi.item_slug = p.slug)
      WHERE p."isActive" = true
      GROUP BY p.id, p.slug, p.name, p."nameKhmer", p.price, p.stock
      ORDER BY total_revenue DESC, units_sold DESC
      LIMIT 10
    `;

    // 9. Payment Method Breakdown (KHQR / COD / Other)
    const paymentMethodsQuery = `
      SELECT
        COALESCE(NULLIF(TRIM("paymentMethod"), ''), 'Other') AS method,
        COUNT(*) AS orders,
        COALESCE(SUM("totalAmount"), 0) AS revenue
      FROM "Order"
      WHERE ${PAID_STATUS_FILTER} ${currentDateWhere}
      GROUP BY COALESCE(NULLIF(TRIM("paymentMethod"), ''), 'Other')
      ORDER BY revenue DESC
    `;

    // 10. Category Revenue Breakdown
    const categoryBreakdownQuery = `
      WITH paid_items AS (
        SELECT
          item->>'id' AS item_id,
          item->>'slug' AS item_slug,
          GREATEST(COALESCE(NULLIF(item->>'quantity', '')::numeric, 1), 1) AS qty,
          COALESCE(NULLIF(item->>'price', '')::numeric, 0) AS unit_price
        FROM "Order" o
        CROSS JOIN LATERAL jsonb_array_elements(o.items::jsonb) AS item
        WHERE ${PAID_STATUS_FILTER}
          ${currentDateWhere}
          AND jsonb_typeof(o.items::jsonb) = 'array'
      )
      SELECT
        c.id,
        c.name,
        c."nameKhmer",
        COALESCE(SUM(pi.qty), 0) AS units_sold,
        COALESCE(SUM(pi.qty * pi.unit_price), 0) AS revenue
      FROM paid_items pi
      INNER JOIN "Product" p
        ON (pi.item_id IS NOT NULL AND pi.item_id = p.id::text)
        OR (pi.item_slug IS NOT NULL AND pi.item_slug = p.slug)
      INNER JOIN "Category" c ON c.id = p."categoryId"
      GROUP BY c.id, c.name, c."nameKhmer"
      ORDER BY revenue DESC
      LIMIT 6
    `;

    // 11. Yearly Revenue
    const yearlyRevenueQuery = `
      SELECT
        EXTRACT(YEAR FROM "createdAt") AS year,
        COALESCE(SUM("totalAmount"), 0) AS revenue,
        COUNT(*) AS orders
      FROM "Order"
      WHERE ${PAID_STATUS_FILTER}
      GROUP BY EXTRACT(YEAR FROM "createdAt")
      ORDER BY year DESC
      LIMIT 5
    `;

    // 12. Top Customers (for selected range)
    const topCustomersQuery = `
      SELECT
        "customerName",
        "customerEmail",
        "customerPhone",
        COUNT(*) AS order_count,
        COALESCE(SUM("totalAmount"), 0) AS total_spent,
        MAX("createdAt") AS last_order_date
      FROM "Order"
      WHERE ${PAID_STATUS_FILTER}
        ${currentDateWhere}
        AND "customerName" IS NOT NULL
      GROUP BY "customerName", "customerEmail", "customerPhone"
      ORDER BY total_spent DESC
      LIMIT 10
    `;

    const [
      productsRes,
      categoriesRes,
      inquiriesRes,
      summaryRes,
      statusRes,
      revenueByDateRes,
      monthlyRevenueRes,
      recentOrdersRes,
      stockRes,
      lowStockRes,
      topProductsRes,
      paymentMethodsRes,
      categoryBreakdownRes,
      yearlyRevenueRes,
      topCustomersRes,
    ] = await Promise.all([
      pgClient.query(productsCountQuery),
      pgClient.query(categoriesCountQuery),
      pgClient.query(inquiriesCountQuery),
      pgClient.query(summaryQuery),
      pgClient.query(statusQuery),
      pgClient.query(revenueByDateQuery),
      pgClient.query(monthlyRevenueQuery),
      pgClient.query(recentOrdersQuery),
      pgClient.query(stockQuery),
      pgClient.query(lowStockProductsQuery),
      pgClient.query(topProductsQuery),
      pgClient.query(paymentMethodsQuery),
      pgClient.query(categoryBreakdownQuery),
      pgClient.query(yearlyRevenueQuery),
      pgClient.query(topCustomersQuery),
    ]);

    const summary = summaryRes.rows[0] || {};
    const revenue = parseFloat(summary.revenue || '0');
    const orders = parseInt(summary.paid_orders || '0');
    const prevRevenue = parseFloat(summary.prev_revenue || '0');
    const prevOrders = parseInt(summary.prev_paid_orders || '0');

    const stats = {
      range,
      products: parseInt(productsRes.rows[0]?.count || '0'),
      categories: parseInt(categoriesRes.rows[0]?.count || '0'),
      inquiries: parseInt(inquiriesRes.rows[0]?.count || '0'),
      orders,
      revenue,
      aov: orders > 0 ? Number((revenue / orders).toFixed(2)) : 0,
      revenueGrowth: range === 'all' ? null : calcGrowth(revenue, prevRevenue),
      ordersGrowth: range === 'all' ? null : calcGrowth(orders, prevOrders),
      allTimeRevenue: parseFloat(summary.all_time_revenue || '0'),
      allTimePaidOrders: parseInt(summary.all_time_paid_orders || '0'),
      pendingOrders: parseInt(summary.pending_orders || '0'),
      cancelledOrders: parseInt(summary.cancelled_orders || '0'),
    };

    const statusData = statusRes.rows.map((row: any) => ({
      status: row.status,
      count: parseInt(row.count || '0'),
    }));

    const revenueData = revenueByDateRes.rows.map((row: any) => ({
      date: new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: parseFloat(row.revenue || '0'),
      orders: parseInt(row.orders || '0'),
    }));

    const monthlyRevenue = monthlyRevenueRes.rows.map((row: any) => ({
      month: row.month,
      label: row.label,
      revenue: parseFloat(row.revenue || '0'),
      orders: parseInt(row.orders || '0'),
    }));

    const stockRow = stockRes.rows[0] || {};
    const stock = {
      total: parseInt(stockRow.total_products || '0'),
      totalUnits: parseInt(stockRow.total_units || '0'),
      inventoryValue: parseFloat(stockRow.inventory_value || '0'),
      inStock: parseInt(stockRow.in_stock || '0'),
      lowStock: parseInt(stockRow.low_stock || '0'),
      outOfStock: parseInt(stockRow.out_of_stock || '0'),
      published: parseInt(stockRow.published || '0'),
      hidden: parseInt(stockRow.hidden || '0'),
      featured: parseInt(stockRow.featured || '0'),
    };

    const lowStockProducts = lowStockRes.rows.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      nameKhmer: row.nameKhmer,
      sku: row.sku,
      stock: parseInt(row.stock || '0'),
      price: parseFloat(row.price || '0'),
    }));

    const topProducts = topProductsRes.rows.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      nameKhmer: row.nameKhmer,
      price: parseFloat(row.price || '0'),
      stock: parseInt(row.stock || '0'),
      orderCount: parseInt(row.order_count || '0'),
      unitsSold: parseInt(row.units_sold || '0'),
      totalRevenue: parseFloat(row.total_revenue || '0'),
    }));

    const paymentMethods = paymentMethodsRes.rows.map((row: any) => ({
      method: row.method,
      orders: parseInt(row.orders || '0'),
      revenue: parseFloat(row.revenue || '0'),
    }));

    const categoryBreakdown = categoryBreakdownRes.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      nameKhmer: row.nameKhmer,
      unitsSold: parseInt(row.units_sold || '0'),
      revenue: parseFloat(row.revenue || '0'),
    }));

    const yearlyRevenue = yearlyRevenueRes.rows.map((row: any) => ({
      year: parseInt(row.year),
      revenue: parseFloat(row.revenue || '0'),
      orders: parseInt(row.orders || '0'),
    }));

    const topCustomers = topCustomersRes.rows.map((row: any) => ({
      customerName: row.customerName,
      customerEmail: row.customerEmail,
      customerPhone: row.customerPhone,
      orderCount: parseInt(row.order_count || '0'),
      totalSpent: parseFloat(row.total_spent || '0'),
      lastOrderDate: row.last_order_date,
    }));

    res.json({
      stats,
      statusData,
      revenueData,
      recentOrders: recentOrdersRes.rows,
      monthlyRevenue,
      stock,
      lowStockProducts,
      topProducts,
      paymentMethods,
      categoryBreakdown,
      yearlyRevenue,
      topCustomers,
    });
  } catch (err: any) {
    console.error('Stats Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (pgClient) await pgClient.release();
  }
});

export default router;
