import { Router, Response } from 'express';
import { getPgClient } from '../lib/db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

const ALLOWED_TABLES = ['Product', 'Category', 'Order', 'Inquiry', 'Setting'];

router.post('/', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  let pgClient;
  try {
    const { table, action, data, match } = req.body;

    if (!ALLOWED_TABLES.includes(table)) {
      res.status(403).json({ error: `Table '${table}' is not allowed for dynamic CRUD` });
      return;
    }

    if (!['insert', 'update', 'delete'].includes(action)) {
      res.status(400).json({ error: `Invalid action: ${action}` });
      return;
    }

    const isValidIdentifier = (str: string) => /^[a-zA-Z0-9_]+$/.test(str);

    if (data && typeof data === 'object') {
      const keys = Object.keys(data);
      for (const key of keys) {
        if (!isValidIdentifier(key)) {
          console.error(`🚨 SQL Injection blocked on column name: ${key}`);
          res.status(400).json({ error: `Invalid column name detected: ${key}` });
          return;
        }
      }
    }

    if (match && Object.keys(match).length > 0) {
      const matchKey = Object.keys(match)[0];
      if (!isValidIdentifier(matchKey)) {
        console.error(`🚨 SQL Injection blocked on match criteria: ${matchKey}`);
        res.status(400).json({ error: `Invalid match column detected: ${matchKey}` });
        return;
      }
      
      if (matchKey.toLowerCase() === 'password') {
        res.status(403).json({ error: `Cannot use protected column as match criteria: ${matchKey}` });
        return;
      }
    }

    pgClient = await getPgClient();

    if (action === 'delete') {
      if (table === 'Order') {
        res.status(403).json({ error: "Audit Trail Protection: Orders cannot be permanently deleted. Please mark them as Cancelled instead." });
        return;
      }

      if (!req.user?.isSuperAdmin) {
        res.status(403).json({ error: "Only Super Admins have permission to delete records." });
        return;
      }

      if (!match || !match.id) {
        res.status(400).json({ error: "Missing match.id for delete" });
        return;
      }
      
      const query = `DELETE FROM "${table}" WHERE id = $1 RETURNING *`;
      const { rows } = await pgClient.query(query, [match.id]);
      res.json({ data: rows[0], error: null });
      return;
    }

    if (action === 'insert') {
      if (!data || typeof data !== 'object') {
        res.status(400).json({ error: "Missing data object for insert" });
        return;
      }

      const keys = Object.keys(data);
      const values = Object.values(data);
      
      const columns = keys.map(k => `"${k}"`).join(', ');
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

      const query = `INSERT INTO "${table}" (${columns}) VALUES (${placeholders}) RETURNING *`;
      const { rows } = await pgClient.query(query, values);
      res.json({ data: rows, error: null });
      return;
    }

    if (action === 'update') {
      if (!data || typeof data !== 'object') {
        res.status(400).json({ error: "Missing data object for update" });
        return;
      }
      
      let matchKey = 'id';
      let matchVal = match?.id;

      if (match && Object.keys(match).length > 0) {
        matchKey = Object.keys(match)[0];
        matchVal = match[matchKey];
      }

      if (!matchVal) {
        res.status(400).json({ error: "Missing match criteria for update" });
        return;
      }

      let query = `UPDATE "${table}" SET `;
      const values: any[] = [];
      let counter = 1;

      for (const [key, value] of Object.entries(data)) {
        query += `"${key}" = $${counter}, `;
        values.push(value);
        counter++;
      }

      query = query.slice(0, -2);
      
      query += ` WHERE "${matchKey}" = $${counter} RETURNING *`;
      values.push(matchVal);

      const { rows } = await pgClient.query(query, values);
      res.json({ data: rows[0], error: null });
      return;
    }

  } catch (err: any) {
    console.error(`CRUD Error (${req.body.action} on ${req.body.table}):`, err);
    res.status(500).json({ error: err.message, data: null });
  } finally {
    if (pgClient) await pgClient.release();
  }
});

export default router;
