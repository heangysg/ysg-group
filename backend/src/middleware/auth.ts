import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getPgClient } from '../lib/db';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET environment variable is missing. Server refuses to start with an insecure configuration.");
}

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      const pgClient = await getPgClient();
      try {
        const { rows } = await pgClient.query('SELECT "isActive" FROM "User" WHERE id = $1 LIMIT 1', [decoded.id]);
        
        if (rows.length === 0 || !rows[0].isActive) {
           res.status(403).json({ error: "Your account has been deactivated or deleted" });
           return;
        }
      } finally {
        await pgClient.release();
      }

      req.user = decoded;
      next();
    } catch (err) {
      res.status(403).json({ error: "Invalid or expired token" });
    }
  } else {
    res.status(401).json({ error: "Authorization header missing" });
  }
};
