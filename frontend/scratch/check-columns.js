import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumns() {
  const { data, error } = await supabase
    .from("User")
    .select("*")
    .limit(1)

  if (error) {
    console.error("Error fetching User table:", error)
    return
  }

  if (data && data.length > 0) {
    console.log("Columns found in User table:", Object.keys(data[0]))
  } else {
    console.log("User table is empty, could not determine columns.")
  }
}

checkColumns()
