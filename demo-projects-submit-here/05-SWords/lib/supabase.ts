import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://alzdsgrnwvrqecbeoply.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsemRzZ3Jud3ZycWVjYmVvcGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzEwMzUsImV4cCI6MjA2NzA0NzAzNX0.KzCkCe9kNXnyn753oAZk087fdENbv-FhV6h7jhq71AU"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type SwordsData = {
  id: number
  content: string | null
  author: string | null
  origin: string | null
  user: string | null
}
