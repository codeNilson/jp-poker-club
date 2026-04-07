import "server-only"

import { createSupabaseServerPublicClient } from "@/lib/supabase/server"

const NEWS_IMAGES_BUCKET = "jp-poker-club-image-vault"

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
  slug: string
  category: NewsRow["category"]
  coverImageUrl: string | null
  readTimeMinutes: number
  publishedAt: string
  isHot: boolean
}

export type NewsArticle = NewsPreview & {
  content: string
}

function extractObjectPathFromStoredValue(value: string): string | null {
  const trimmedValue = value.trim().replace(/^\/+/, "")

  if (!trimmedValue) {
    return null
  }

  const storagePathPattern = /storage\/v1\/object\/public\/([^/]+)\/(.+)$/
  const storagePathMatch = trimmedValue.match(storagePathPattern)

  if (storagePathMatch) {
    const [, bucket, objectPath] = storagePathMatch
    return bucket === NEWS_IMAGES_BUCKET ? objectPath : null
  }

  const bucketPrefix = `${NEWS_IMAGES_BUCKET}/`
  if (trimmedValue.startsWith(bucketPrefix)) {
    return trimmedValue.slice(bucketPrefix.length)
  }

  return trimmedValue
}

type PublicSupabaseClient = ReturnType<typeof createSupabaseServerPublicClient>

function resolveCoverImageUrl(
  supabase: PublicSupabaseClient,
  rowCoverImageUrl: string | null
): string | null {
  if (!rowCoverImageUrl) {
    return null
  }

  const objectPath = extractObjectPathFromStoredValue(rowCoverImageUrl)

  if (!objectPath) {
    return null
  }

  const { data } = supabase.storage.from(NEWS_IMAGES_BUCKET).getPublicUrl(objectPath)
  return data.publicUrl
}

function mapPreview(supabase: PublicSupabaseClient, row: NewsRow): NewsPreview {
  return {
    id: row.id,
    title: row.title,
    summary: row.description,
    slug: row.slug,
    category: row.category,
    coverImageUrl: resolveCoverImageUrl(supabase, row.cover_image_url),
    readTimeMinutes: row.read_time_minutes,
    publishedAt: row.published_at,
    isHot: row.is_hot,
  }
}

function mapArticle(supabase: PublicSupabaseClient, row: NewsRow): NewsArticle {
  return {
    ...mapPreview(supabase, row),
    content: row.content,
  }
}

export async function getFeaturedNews(): Promise<NewsPreview | null> {
  const supabase = createSupabaseServerPublicClient()

  const { data, error } = await supabase
    .from("news")
    .select("id,title,description,slug,category,cover_image_url,read_time_minutes,is_featured,is_hot,is_active,published_at")
    .eq("is_active", true)
    .lte("published_at", new Date().toISOString())
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return mapPreview(supabase, data as NewsRow)
}

export async function getNewsFeed(limit = 6): Promise<NewsPreview[]> {
  const supabase = createSupabaseServerPublicClient()

  const { data, error } = await supabase
    .from("news")
    .select("id,title,description,slug,category,cover_image_url,read_time_minutes,is_featured,is_hot,is_active,published_at")
    .eq("is_active", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return (data as NewsRow[]).map((row) => mapPreview(supabase, row))
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const supabase = createSupabaseServerPublicClient()

  const { data, error } = await supabase
    .from("news")
    .select(
      "id,title,description,content,slug,category,cover_image_url,read_time_minutes,is_featured,is_hot,is_active,published_at"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .lte("published_at", new Date().toISOString())
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return mapArticle(supabase, data as NewsRow)
}

export async function getPublishedNewsSlugs(limit = 200): Promise<string[]> {
  const supabase = createSupabaseServerPublicClient()

  const { data, error } = await supabase
    .from("news")
    .select("slug")
    .eq("is_active", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data.map((item) => item.slug)
}
