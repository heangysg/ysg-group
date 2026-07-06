import { Router, Response } from 'express';
import { getPgClient } from '../lib/db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

const ALLOWED_TABLES = ['Product', 'Category', 'Order', 'Inquiry', 'Setting', 'User', 'audit_logs'];

router.post('/', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  let pgClient;
  try {
    const { table, select, eq, neq, ilike, or, order, limit, offset, countExact } = req.body;

    if (!ALLOWED_TABLES.includes(table)) {
      res.status(403).json({ error: `Table '${table}' is not allowed` });
      return;
    }

    const isValidIdentifier = (str: string) => /^[a-zA-Z0-9_]+$/.test(str);
    
    const PROTECTED_COLUMNS = ['password'];
    const isProtectedColumn = (str: string) => PROTECTED_COLUMNS.includes(str.toLowerCase());

    let query = 'SELECT ';
    
    if (select && select !== '*') {
      let cols = select.split(',').map((c: string) => c.trim());
      for (const col of cols) {
        if (!isValidIdentifier(col)) {
          res.status(400).json({ error: `Invalid column in select: ${col}` });
          return;
        }
      }
      
      if (table === 'User') {
        cols = cols.filter((c: string) => c.toLowerCase() !== 'password');
        if (cols.length === 0) {
          res.status(400).json({ error: `Cannot query only protected columns` });
          return;
        }
      }
      query += cols.map((c: string) => `"${c}"`).join(', ');
    } else {
      if (table === 'User') {
        query += '"id", "name", "email", "isSuperAdmin", "roleId", "isActive", "createdAt", "updatedAt"';
      } else {
        query += '*';
      }
    }

    query += ` FROM "${table}"`;
    const values: any[] = [];
    let counter = 1;
    const whereClauses: string[] = [];

    if (req.body.isNull && Array.isArray(req.body.isNull)) {
      for (const key of req.body.isNull) {
        if (!isValidIdentifier(key)) {
          res.status(400).json({ error: `Invalid column in isNull: ${key}` });
          return;
        }
        if (isProtectedColumn(key)) {
          res.status(403).json({ error: `Cannot query protected column: ${key}` });
          return;
        }
        whereClauses.push(`"${key}" IS NULL`);
      }
    }

    if (req.body.isNotNull && Array.isArray(req.body.isNotNull)) {
      for (const key of req.body.isNotNull) {
        if (!isValidIdentifier(key)) {
          res.status(400).json({ error: `Invalid column in isNotNull: ${key}` });
          return;
        }
        if (isProtectedColumn(key)) {
          res.status(403).json({ error: `Cannot query protected column: ${key}` });
          return;
        }
        whereClauses.push(`"${key}" IS NOT NULL`);
      }
    }

    if (eq && typeof eq === 'object') {
      for (const [key, val] of Object.entries(eq)) {
        if (!isValidIdentifier(key)) {
          res.status(400).json({ error: `Invalid column in eq: ${key}` });
          return;
        }
        if (isProtectedColumn(key)) {
          res.status(403).json({ error: `Cannot query protected column: ${key}` });
          return;
        }
        if (val === null) {
          whereClauses.push(`"${key}" IS NULL`);
        } else {
          whereClauses.push(`"${key}" = $${counter}`);
          values.push(val);
          counter++;
        }
      }
    }

    if (neq && typeof neq === 'object') {
      for (const [key, val] of Object.entries(neq)) {
        if (!isValidIdentifier(key)) {
          res.status(400).json({ error: `Invalid column in neq: ${key}` });
          return;
        }
        if (isProtectedColumn(key)) {
          res.status(403).json({ error: `Cannot query protected column: ${key}` });
          return;
        }
        whereClauses.push(`"${key}" != $${counter}`);
        values.push(val);
        counter++;
      }
    }

    if (ilike && typeof ilike === 'object') {
      for (const [key, val] of Object.entries(ilike)) {
        if (!isValidIdentifier(key)) {
          res.status(400).json({ error: `Invalid column in ilike: ${key}` });
          return;
        }
        if (isProtectedColumn(key)) {
          res.status(403).json({ error: `Cannot query protected column: ${key}` });
          return;
        }
        whereClauses.push(`"${key}" ILIKE $${counter}`);
        values.push(val);
        counter++;
      }
    }

    if (or && typeof or === 'string') {
      const conditions = or.split(',');
      const orClauses = [];
      for (const cond of conditions) {
        const parts = cond.split('.ilike.');
        if (parts.length === 2) {
          const col = parts[0];
          const val = parts[1];
          if (!isValidIdentifier(col)) {
            res.status(400).json({ error: `Invalid column in OR: ${col}` });
            return;
          }
          if (isProtectedColumn(col)) {
            res.status(403).json({ error: `Cannot query protected column: ${col}` });
            return;
          }
          orClauses.push(`"${col}" ILIKE $${counter}`);
          values.push(val);
          counter++;
        }
      }
      if (orClauses.length > 0) {
        whereClauses.push(`(${orClauses.join(' OR ')})`);
      }
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    if (order && typeof order === 'object') {
      const { column, ascending } = order;
      if (column && isValidIdentifier(column)) {
        if (isProtectedColumn(column)) {
          res.status(403).json({ error: `Cannot order by protected column: ${column}` });
          return;
        }
        query += ` ORDER BY "${column}" ${ascending ? 'ASC' : 'DESC'}`;
      }
    }

    if (limit !== undefined) {
      query += ` LIMIT $${counter}`;
      values.push(parseInt(limit));
      counter++;
    }
    
    if (offset !== undefined) {
      query += ` OFFSET $${counter}`;
      values.push(parseInt(offset));
      counter++;
    }

    pgClient = await getPgClient();

    let count = null;
    if (countExact) {
      const countQuery = `SELECT COUNT(*) FROM "${table}" ${whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : ''}`;
      const countValues = values.slice(0, counter - 1 - (limit !== undefined ? 1 : 0) - (offset !== undefined ? 1 : 0));
      const { rows: countRows } = await pgClient.query(countQuery, countValues);
      count = parseInt(countRows[0].count);
    }

    const { rows } = await pgClient.query(query, values);

    res.json({ data: rows, count, error: null });
  } catch (err: any) {
    console.error(`Read Proxy Error:`, err);
    res.status(500).json({ error: err.message, data: null });
  } finally {
    if (pgClient) await pgClient.release();
  }
});

export default router;
