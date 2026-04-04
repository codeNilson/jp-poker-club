import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"

type NewsRow = {
  id: string
  title: string
  description: string
  content: string
  slug: string
  category: "clube" | "eventos" | "ranking" | "assinatura" | "comunicado" | "promocao"
  cover_image_url: string | null
  read_time_minutes: number
  is_featured: boolean
  is_hot: boolean
  is_active: boolean
  published_at: string
}

export type NewsPreview = {
  id: string
  title: string
  summary: string
  category: NewsRow["category"]
  readTimeMinutes: number
  publishedAt: string
  isHot: boolean
}

function mapPreview(row: NewsRow): NewsPreview {
  return {
    id: row.id,
    title: row.title,
    summary: row.description,
    category: row.category,
    readTimeMinutes: row.read_time_minutes,
    publishedAt: row.published_at,
    isHot: row.is_hot,
  }
}

export async function getFeaturedNews(): Promise<NewsPreview | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("news")
    .select("id,title,description,category,read_time_minutes,is_featured,is_hot,is_active,published_at")
    .eq("is_active", true)
    .lte("published_at", new Date().toISOString())
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return mapPreview(data as NewsRow)
}

export async function getNewsFeed(limit = 6): Promise<NewsPreview[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("news")
    .select("id,title,description,category,read_time_minutes,is_featured,is_hot,is_active,published_at")
    .eq("is_active", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return (data as NewsRow[]).map(mapPreview)
}
