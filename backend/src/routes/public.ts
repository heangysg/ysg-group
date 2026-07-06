import { Router, Request, Response } from 'express';
import { getPgClient } from '../lib/db';
import rateLimit from 'express-rate-limit';

const router = Router();

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: "Too many submissions. Please try again later." }
});

router.post('/contact', formLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    if (name.length > 100 || email.length > 100 || (phone && phone.length > 50) || message.length > 1000) {
      res.status(400).json({ error: "Input exceeds maximum allowed length" });
      return;
    }

    const pgClient = await getPgClient();
    try {
      const query = `
        INSERT INTO "ContactMessage" (name, email, phone, message, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id;
      `;
      const values = [name, email, phone || null, message];
      
      const result = await pgClient.query(query, values);
      res.json({ success: true, id: result.rows[0].id });
    } finally {
      await pgClient.release();
    }
  } catch (error) {
    console.error("Error submitting contact message:", error);
    res.status(500).json({ error: "Failed to submit message" });
  }
});

router.post('/inquiry', formLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerName, customerPhone, message, productId } = req.body;

    if (!customerName || !customerPhone || !message) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    if (customerName.length > 100 || customerPhone.length > 50 || message.length > 1000) {
      res.status(400).json({ error: "Input exceeds maximum allowed length" });
      return;
    }

    const pgClient = await getPgClient();
    try {
      const query = `
        INSERT INTO "Inquiry" ("customerName", "customerPhone", message, "productId", status, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW())
        RETURNING id;
      `;
      const values = [customerName, customerPhone, message, productId || null];
      
      const result = await pgClient.query(query, values);
      res.json({ success: true, id: result.rows[0].id });
    } finally {
      await pgClient.release();
    }
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    res.status(500).json({ error: "Failed to submit inquiry" });
  }
});

router.get('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const pgClient = await getPgClient();
    try {
      const { rows } = await pgClient.query('SELECT * FROM "Category" WHERE "isActive" = true ORDER BY "sortOrder" ASC');
      res.set('Cache-Control', 'public, max-age=300, s-maxage=300');
      res.json({ data: rows });
    } finally {
      await pgClient.release();
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.get('/products', async (req: Request, res: Response): Promise<void> => {
  try {
    const { featured, limit } = req.query;
    const pgClient = await getPgClient();
    try {
      let query = 'SELECT * FROM "Product" WHERE "isPublished" = true';
      const values: any[] = [];
      let idx = 1;

      if (featured === 'true') {
        query += ` AND "isFeatured" = true`;
      }

      query += ' ORDER BY "createdAt" DESC';

      if (limit) {
        query += ` LIMIT $${idx}`;
        values.push(parseInt(limit as string));
      }

      const { rows } = await pgClient.query(query, values);
      res.set('Cache-Control', 'public, max-age=300, s-maxage=300');
      res.json({ data: rows });
    } finally {
      await pgClient.release();
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get('/products/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const pgClient = await getPgClient();
    try {
      const { rows } = await pgClient.query('SELECT * FROM "Product" WHERE slug = $1 AND "isPublished" = true LIMIT 1', [req.params.slug]);
      if (rows.length === 0) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      res.set('Cache-Control', 'public, max-age=300, s-maxage=300');
      res.json({ data: rows[0] });
    } finally {
      await pgClient.release();
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.get('/settings', async (req: Request, res: Response): Promise<void> => {
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
      const { rows } = await pgClient.query('SELECT key, value FROM "Setting"');
      
      const settingsObj: Record<string, string> = {};
      rows.forEach(row => {
        settingsObj[row.key] = row.value;
      });
      
      res.json({ data: settingsObj });
    } finally {
      await pgClient.release();
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

export default router;
