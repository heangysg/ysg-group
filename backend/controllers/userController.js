const supabase = require('../config/supabase');

exports.getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('User')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id, ...updateData } = req.body;
  try {
    const { data: user, error } = await supabase
      .from('User')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    res.json({ logs: [] });
  } catch (err) {
    res.json({ logs: [] });
  }
};exports.createUser = async (req, res) => {
  const { name, email, password, isSuperAdmin } = req.body;
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
