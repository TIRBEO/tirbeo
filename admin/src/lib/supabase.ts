import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://mvogfnbqpaiedkkslecn.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12b2dmbmJxcGFpZWRra3NsZWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTcyMTcsImV4cCI6MjA5ODAzMzIxN30.wptUzKL7XvYEUjfbxNjklu0HI4s_pAnQ4KOUFiKbjxc"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
