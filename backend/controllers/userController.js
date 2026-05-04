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
