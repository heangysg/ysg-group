const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function linkOrders() {
  const { data, error } = await supabase
    .from('Order')
    .update({ customerEmail: 'hakchhaiheang0@gmail.com' })
    .eq('customerName', 'Emma Heang'); // Emma Heang seems to be the one who made the orders
  
  if (error) {
    console.error('Error linking orders:', error);
  } else {
    console.log('Orders linked successfully!');
  }
}

linkOrders();
