import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { supabase } from '../lib/supabase';
import { getPgClient } from '../lib/db';

const router = Router();

router.post('/checkout', async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerName, customerPhone, customerEmail, address, paymentMethod, items } = req.body;

    if (!customerName || String(customerName).length > 100) return res.status(400).json({ error: "Invalid or overly long customer name (max 100)" }) as any;
    if (!customerPhone || String(customerPhone).length > 20) return res.status(400).json({ error: "Invalid or overly long phone number (max 20)" }) as any;
    if (customerEmail && String(customerEmail).length > 100) return res.status(400).json({ error: "Overly long email (max 100)" }) as any;
    if (!address || String(address).length > 500) return res.status(400).json({ error: "Invalid or overly long address (max 500)" }) as any;
    if (!paymentMethod || String(paymentMethod).length > 50) return res.status(400).json({ error: "Invalid payment method" }) as any;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "No items provided" });
      return;
    }

    if (items.length > 50) {
      res.status(400).json({ error: "Too many items in a single order (Max 50 allowed)." });
      return;
    }

    let totalAmount = 0;
    const validatedItems = [];

    const pgClient = await getPgClient();
    try {
      const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str));

      for (const item of items) {
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          res.status(400).json({ error: `Invalid quantity detected for item: ${item.name || item.id}` });
          return;
        }

        const identifier = item.id || item.slug;
        let product = null;

        if (isUUID(identifier)) {
          const { rows } = await pgClient.query('SELECT id, name, price, thumbnail FROM "Product" WHERE id = $1 LIMIT 1', [identifier]);
          product = rows[0];
        }

        if (!product) {
          const { rows } = await pgClient.query('SELECT id, name, price, thumbnail FROM "Product" WHERE slug = $1 LIMIT 1', [identifier]);
          product = rows[0];
        }
          
        if (!product) {
           res.status(404).json({ error: `Product not found: ${item.name || identifier}` });
           return;
        }

        if (product.price === null || product.price === undefined || product.price <= 0) {
           res.status(400).json({ error: `Product '${product.name}' cannot be purchased directly. Please submit an inquiry for a custom quote.` });
           return;
        }

        totalAmount += product.price * item.quantity;
        validatedItems.push({
          ...item,
          price: product.price,
          image: product.thumbnail || item.image
        });
      }

      if (totalAmount <= 0) {
        res.status(400).json({ error: "Order total must be greater than zero" });
        return;
      }

      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const shortId = Array.from({ length: 10 }, () => alphabet.charAt(crypto.randomInt(0, alphabet.length))).join('');
      
      const query = `
        INSERT INTO "Order" (id, "customerName", "customerPhone", "customerEmail", address, "paymentMethod", "totalAmount", items, status, "createdAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING *;
      `;
      const values = [
        shortId, 
        customerName, 
        customerPhone, 
        customerEmail || null, 
        address, 
        paymentMethod, 
        totalAmount, 
        JSON.stringify(validatedItems), 
        "pending"
      ];
      
      const result = await pgClient.query(query, values);
      const newOrder = result.rows[0];
      
      // Dispatch Telegram Sales Notification Alert (Background)
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      if (botToken && chatId) {
        const itemsText = validatedItems.map(i => `- ${i.name} (x${i.quantity}) - $${(i.price * i.quantity).toFixed(2)}`).join('\n');
        const tgText = `🛍️ *ការបញ្ជាទិញថ្មី (NEW ORDER)* 🛍️\n\n*Order ID:* \`${newOrder.id}\`\n*Customer:* ${customerName}\n*Phone:* ${customerPhone}\n*Payment:* ${paymentMethod}\n*Total:* $${totalAmount.toFixed(2)}\n\n*Items:*\n${itemsText}`;
        
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: tgText, parse_mode: 'Markdown' })
        }).catch(err => console.error("Telegram Order Alert Error:", err));
      }

      res.json({ order: newOrder });
    } finally {
      await pgClient.release();
    }
    
  } catch (err: any) {
    console.error("Checkout Error:", err);
    res.status(500).json({ error: "Failed to process checkout" });
  }
});

router.get('/user/find', async (req: Request, res: Response): Promise<void> => {
  const email = (req.query.email as string || '').trim();
  const phone = (req.query.phone as string || '').trim();

  if (!email && !phone) {
    res.json({ data: [] });
    return;
  }

  const pgClient = await getPgClient();
  try {
    const query = `
      SELECT id, "customerName", "customerPhone", "customerEmail", address, "paymentMethod", "totalAmount", items, status, "createdAt"
      FROM "Order" 
      WHERE ($1 <> '' AND "customerEmail" ILIKE $1)
         OR ($2 <> '' AND (
            "customerPhone" = $2
            OR REPLACE(REPLACE(REPLACE("customerPhone", ' ', ''), '-', ''), '+855', '0') = REPLACE(REPLACE(REPLACE($2, ' ', ''), '-', ''), '+855', '0')
         ))
      ORDER BY "createdAt" DESC
    `;
    const { rows } = await pgClient.query(query, [email, phone]);
    res.json({ data: rows });
  } catch (error) {
    console.error("Fetch User Orders Error:", error);
    res.status(500).json({ error: "Failed to fetch user orders" });
  } finally {
    await pgClient.release();
  }
});

router.get('/user/:identifier', async (req: Request, res: Response): Promise<void> => {
  const { identifier } = req.params;
  
  if (!identifier || typeof identifier !== 'string') {
    res.status(400).json({ error: "Invalid user identifier" });
    return;
  }

  const pgClient = await getPgClient();
  try {
    const query = `
      SELECT id, "customerName", "customerPhone", "customerEmail", address, "paymentMethod", "totalAmount", items, status, "createdAt"
      FROM "Order" 
      WHERE "customerEmail" ILIKE $1 OR "customerPhone" = $1 OR id = $1
      ORDER BY "createdAt" DESC
    `;
    const { rows } = await pgClient.query(query, [identifier]);
    
    res.json({ data: rows });
  } catch (error) {
    console.error("Fetch User Orders Error:", error);
    res.status(500).json({ error: "Failed to fetch user orders" });
  } finally {
    await pgClient.release();
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const rawParam = req.params.id;
  const rawId = (Array.isArray(rawParam) ? rawParam[0] : (rawParam || '')).toString().trim();
  
  if (!rawId) {
    res.status(400).json({ error: "Invalid order ID" });
    return;
  }

  const pgClient = await getPgClient();
  try {
    const query = `
      SELECT id, "customerName", "customerPhone", "customerEmail", address, "paymentMethod", "totalAmount", items, status, "createdAt"
      FROM "Order" 
      WHERE UPPER(TRIM(id)) = UPPER(TRIM($1)) OR id = $1
      LIMIT 1
    `;
    const { rows } = await pgClient.query(query, [rawId]);
    
    if (rows.length === 0) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Fetch Order Error:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  } finally {
    await pgClient.release();
  }
});

router.post('/track', async (req: Request, res: Response): Promise<void> => {
  const rawOrderId = (req.body.orderId || '').toString().trim();
  const rawPhone = (req.body.phone || '').toString().trim();
  
  if (!rawOrderId || !rawPhone) {
    res.status(400).json({ error: "Order ID and Phone number are required" });
    return;
  }

  const cleanOrderId = rawOrderId.replace(/^#/, '').trim();

  const pgClient = await getPgClient();
  try {
    const query = `
      SELECT id, "customerName", "customerPhone", "customerEmail", address, "paymentMethod", "totalAmount", items, status, "createdAt"
      FROM "Order" 
      WHERE (UPPER(TRIM(id)) = UPPER(TRIM($1)) OR id = $1)
        AND (
          "customerPhone" = $2
          OR REPLACE(REPLACE(REPLACE("customerPhone", ' ', ''), '-', ''), '+855', '0') = REPLACE(REPLACE(REPLACE($2, ' ', ''), '-', ''), '+855', '0')
        )
      LIMIT 1
    `;
    const { rows } = await pgClient.query(query, [cleanOrderId, rawPhone]);
    
    if (rows.length === 0) {
      res.status(404).json({ error: "Order not found or phone number does not match." });
      return;
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Track Order Error:", error);
    res.status(500).json({ error: "Failed to track order" });
  } finally {
    await pgClient.release();
  }
});

export default router;
