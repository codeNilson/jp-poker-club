import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export type AdminNewsRow = {
  id: string
  title: string
  description: string
  content: string
  slug: string
  category: string
  cover_image_url: string | null
  read_time_minutes: number
  is_featured: boolean
  is_hot: boolean
  is_active: boolean
  published_at: string
  created_at: string
  updated_at: string
}

export async function getAdminNewsItems() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("news")
    .select("id,title,description,content,slug,category,cover_image_url,read_time_minutes,is_featured,is_hot,is_active,published_at,created_at,updated_at")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false })

  if (error || !data) {
    return [] as AdminNewsRow[]
  }

  return data as AdminNewsRow[]
}
