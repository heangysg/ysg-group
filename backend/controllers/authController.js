const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // In a real app, use bcrypt.compare
    // const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = user.password === password;

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isSuperAdmin: user.isSuperAdmin,
        image: user.image
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('User')
      .insert([{
        name: 'Admin User',
        email: 'admin@ysgmachinery.com',
        password: 'admin123',
        isActive: true,
        createdAt: new Date().toISOString()
      }]);
    
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Admin user created! Login with: admin@ysgmachinery.com / admin123' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
