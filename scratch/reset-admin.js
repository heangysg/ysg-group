const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateAdmin() {
  const { data, error } = await supabase
    .from('User')
    .update({ 
      password: 'admin123',
      isSuperAdmin: true,
      isActive: true
    })
    .eq('email', 'hakchhaiheang0@gmail.com');
  
  if (error) {
    console.error('Error updating admin:', error);
  } else {
    console.log('Admin user updated successfully! You can now log in with:');
    console.log('Email: hakchhaiheang0@gmail.com');
    console.log('Password: admin123');
  }
}

updateAdmin();
