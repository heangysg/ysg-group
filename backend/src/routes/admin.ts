import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = user.password === password;

    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isSuperAdmin: user.isSuperAdmin,
        avatar: user.avatar,
        image: user.image
      }
    });
    return;
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }
});

router.get('/audit', (req: Request, res: Response) => {
  res.json({ logs: [] });
});

router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: users, error } = await supabase
      .from('User')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    res.json({ users });
    return;
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }
});

router.post('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, isSuperAdmin } = req.body;

    const { data: user, error } = await supabase
      .from('User')
      .insert([{
        name,
        email,
        password,
        isSuperAdmin,
        isActive: true,
        createdAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ user });
    return;
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }
});

router.patch('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, ...updateData } = req.body;

    const { data: user, error } = await supabase
      .from('User')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ user });
    return;
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }
});

export default router;
