const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
  const { data, error } = await supabase
    .from('Order')
    .select('*');
  
  if (error) {
    console.error('Error fetching orders:', error);
  } else {
    console.log('Orders found:', data.length);
    console.log(JSON.stringify(data, null, 2));
  }
}

checkOrders();
