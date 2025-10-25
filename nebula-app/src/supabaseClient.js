import { createClient } from '@supabase/supabase-js'

// Get the URL and Key from your .env.local file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create and export the client
export const supabase = createClient(supabaseUrl, supabaseKey)