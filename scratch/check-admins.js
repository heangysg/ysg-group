const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmins() {
  const { data, error } = await supabase
    .from('User')
    .select('*');
  
  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Total Users:', data.length);
    data.forEach(u => {
      console.log(`Email: ${u.email}, Password: ${u.password}, SuperAdmin: ${u.isSuperAdmin}, Active: ${u.isActive}`);
    });
  }
}

checkAdmins();
