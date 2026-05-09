import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTable(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .limit(1)

  if (error) {
    console.error(`Error fetching ${tableName} table:`, error)
    return
  }

  if (data && data.length > 0) {
    console.log(`Columns found in ${tableName} table:`, Object.keys(data[0]))
  } else {
    console.log(`${tableName} table is empty, could not determine columns.`)
  }
}

async function start() {
  await checkTable("Inquiry")
  await checkTable("Order")
}

start()
