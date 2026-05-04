const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSlugs() {
  console.log('--- PRODUCTS ---');
  const { data: products } = await supabase.from('Product').select('slug, name').limit(5);
  console.log(products);

  console.log('--- CATEGORIES ---');
  const { data: categories } = await supabase.from('Category').select('slug, name').limit(5);
  console.log(categories);
}

checkSlugs();
