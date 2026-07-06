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
    if (!customerEmail || String(customerEmail).length > 100) return res.status(400).json({ error: "Invalid or overly long email (max 100)" }) as any;
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
        INSERT INTO "Order" (id, "customerName", "customerPhone", "customerEmail", address, "paymentMethod", "totalAmount", items, status, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *;
      `;
      const values = [
        shortId, 
        customerName, 
        customerPhone, 
        customerEmail, 
        address, 
        paymentMethod, 
        totalAmount, 
        JSON.stringify(validatedItems), 
        "pending"
      ];
      
      const result = await pgClient.query(query, values);
      const newOrder = result.rows[0];
      
      res.json({ order: newOrder });
    } finally {
      await pgClient.release();
    }
    
  } catch (err: any) {
    console.error("Checkout Error:", err);
    res.status(500).json({ error: "Failed to process checkout" });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: "Invalid order ID" });
    return;
  }

  const pgClient = await getPgClient();
  try {
    const query = `
      SELECT id, "customerName", "customerPhone", "customerEmail", address, "paymentMethod", "totalAmount", items, status, "createdAt"
      FROM "Order" 
      WHERE id = $1 
      LIMIT 1
    `;
    const { rows } = await pgClient.query(query, [id]);
    
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

export default router;
