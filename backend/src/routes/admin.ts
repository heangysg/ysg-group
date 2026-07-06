import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { getPgClient } from '../lib/db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET environment variable is missing. Server refuses to start with an insecure configuration.");
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many login attempts from this IP, please try again after 15 minutes." }
});

router.post('/login', loginLimiter, async (req: Request, res: Response): Promise<void> => {
  let pgClient;
  try {
    const { email, password } = req.body;
    
    if (!email || typeof email !== 'string' || email.length > 255) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }
    
    if (!password || typeof password !== 'string' || password.length > 255) {
      res.status(400).json({ error: "Invalid password format" });
      return;
    }
    pgClient = await getPgClient();

    const { rows } = await pgClient.query('SELECT * FROM "User" WHERE email = $1 LIMIT 1', [email]);
    const user = rows[0];

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = user.password === password;
      
      if (isMatch) {
        const hashedPw = await bcrypt.hash(password, 10);
        await pgClient.query('UPDATE "User" SET password = $1 WHERE id = $2', [hashedPw, user.id]);
      }
    }

    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, isSuperAdmin: user.isSuperAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isSuperAdmin: user.isSuperAdmin,
        avatar: user.avatar,
        image: user.image
      }
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (pgClient) await pgClient.release();
  }
});

router.get('/audit', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  let pgClient;
  try {
    const { userId } = req.query;
    if (!userId) {
      res.status(400).json({ error: "Missing userId parameter" });
      return;
    }

    pgClient = await getPgClient();
    
    const { rows: userRows } = await pgClient.query('SELECT email FROM "User" WHERE id = $1', [userId]);
    if (userRows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const targetEmail = userRows[0].email;

    const { rows: logs } = await pgClient.query(
      'SELECT id, action, entity_type, entity_id, details, ip_address, user_agent, created_at FROM "audit_logs" WHERE user_email = $1 ORDER BY created_at DESC LIMIT 50',
      [targetEmail]
    );

    res.json({ logs });
  } catch (err: any) {
    console.error("Audit Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  } finally {
    if (pgClient) await pgClient.release();
  }
});

router.get('/users', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  let pgClient;
  try {
    pgClient = await getPgClient();
    const { rows: users } = await pgClient.query('SELECT id, name, email, "isSuperAdmin", "roleId", "isActive", "createdAt", "updatedAt" FROM "User" ORDER BY "createdAt" DESC');
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  } finally {
    if (pgClient) await pgClient.release();
  }
});

router.post('/users', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  let pgClient;
  try {
    const { name, email, password, isSuperAdmin } = req.body;
    
    if (!password || typeof password !== 'string' || password.length < 8 || password.length > 255) {
      res.status(400).json({ error: "Password must be between 8 and 255 characters long." });
      return;
    }

    if (!name || typeof name !== 'string' || name.length > 100) {
      res.status(400).json({ error: "Invalid name format" });
      return;
    }

    if (!email || typeof email !== 'string' || email.length > 255) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }
    
    if (!req.user?.isSuperAdmin) {
      res.status(403).json({ error: "Only Super Admins can create users" });
      return;
    }

    pgClient = await getPgClient();

    const roleName = isSuperAdmin ? 'ADMIN' : 'USER';
    const { rows: roleRows } = await pgClient.query('SELECT id FROM "Role" WHERE name = $1 LIMIT 1', [roleName]);
    
    if (roleRows.length === 0) {
      throw new Error(`Could not find role: ${roleName}`);
    }
    const roleId = roleRows[0].id;

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO "User" (name, email, password, "isSuperAdmin", "roleId", "isActive", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, name, email, "isSuperAdmin", "roleId", "isActive", "createdAt", "updatedAt"
    `;
    const { rows: userRows } = await pgClient.query(insertQuery, [
      name, email, hashedPassword, isSuperAdmin, roleId, true
    ]);

    res.json({ user: userRows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  } finally {
    if (pgClient) await pgClient.release();
  }
});

router.patch('/users', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  let pgClient;
  try {
    const { id, password, ...updateData } = req.body;

    if (!req.user?.isSuperAdmin && req.user?.id !== id) {
      res.status(403).json({ error: "You can only update your own profile." });
      return;
    }

    if (!req.user?.isSuperAdmin) {
      delete updateData.isSuperAdmin;
      delete updateData.isActive;
      delete updateData.roleId;
    }

    if (req.user.id === id) {
      if (updateData.isActive === false || updateData.isSuperAdmin === false) {
        res.status(400).json({ error: "Self-Sabotage Blocked: You cannot deactivate or demote your own account." });
        return;
      }
    }

    pgClient = await getPgClient();

    let query = 'UPDATE "User" SET ';
    const values: any[] = [];
    let counter = 1;

    const isValidIdentifier = (str: string) => /^[a-zA-Z0-9_]+$/.test(str);

    for (const [key, value] of Object.entries(updateData)) {
      if (!isValidIdentifier(key)) {
        res.status(400).json({ error: `Invalid column name detected: ${key}` });
        return;
      }
      query += `"${key}" = $${counter}, `;
      values.push(value);
      counter++;
    }

    if (password) {
      if (typeof password !== 'string' || password.length < 8 || password.length > 255) {
        res.status(400).json({ error: "Password must be between 8 and 255 characters long." });
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `"password" = $${counter}, `;
      values.push(hashedPassword);
      counter++;
    }

    query += `"updatedAt" = NOW() WHERE id = $${counter} RETURNING id, name, email, "isSuperAdmin", "roleId", "isActive", "createdAt", "updatedAt"`;
    values.push(id);

    const { rows: updatedRows } = await pgClient.query(query, values);

    res.json({ user: updatedRows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  } finally {
    if (pgClient) await pgClient.release();
  }
});

router.post('/audit', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  let pgClient;
  try {
    const { action, entityType, entityId, details } = req.body;
    
    if (!action || !entityType) {
      res.status(400).json({ error: "Missing required audit fields" });
      return;
    }

    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    const userAgent = req.headers['user-agent'] || "unknown";
    
    const userEmail = req.user?.email || "unknown";

    pgClient = await getPgClient();
    
    const query = `
      INSERT INTO "audit_logs" (user_email, action, entity_type, entity_id, details, ip_address, user_agent, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `;
    
    await pgClient.query(query, [
      userEmail, 
      action, 
      entityType, 
      entityId || null, 
      details || {}, 
      ipAddress, 
      userAgent
    ]);

    res.json({ success: true });
  } catch (err: any) {
    console.error("Audit Log Error:", err);
    res.status(500).json({ error: "Failed to record audit log" });
  } finally {
    if (pgClient) await pgClient.release();
  }
});

router.post('/upload', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { image } = req.body;
    
    if (!image) {
      res.status(400).json({ error: "Missing image data" });
      return;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dn4ciyses';
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'ysg-website';

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    const formData = new FormData();
    
    // Parse the data URI to create a Blob
    const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) {
      const mimeType = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, 'base64');
      const blob = new Blob([buffer], { type: mimeType });
      formData.append('file', blob, 'upload.jpg');
    } else {
      // Fallback if it's not a standard data URI (e.g., raw base64 or URL)
      formData.append('file', image);
    }
    
    formData.append('upload_preset', uploadPreset);

    const cloudinaryRes = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData
    });

    const data = await cloudinaryRes.json();

    if (!cloudinaryRes.ok || !data.secure_url) {
      console.error("Cloudinary Proxy Error:", data);
      res.status(500).json({ error: `Cloudinary error: ${data?.error?.message || JSON.stringify(data)}` });
      return;
    }

    res.json({ secure_url: data.secure_url });
  } catch (err: any) {
    console.error("Upload Proxy Error:", err);
    res.status(500).json({ error: "Internal server error during upload proxy" });
  }
});

export default router;
