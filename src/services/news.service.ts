import "server-only"

import { createSupabaseServerPublicClient } from "@/lib/supabase/server"

export const NEWS_IMAGES_BUCKET = "jp-poker-club-image-vault"

export const NEWS_CATEGORY_OPTIONS = [
  "clube",
  "eventos",
  "ranking",
  "assinatura",
  "comunicado",
  "promocao",
] as const

export type NewsCategory = (typeof NEWS_CATEGORY_OPTIONS)[number]

export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  clube: "Clube",
  eventos: "Eventos",
  ranking: "Ranking",
  assinatura: "Assinatura",
  comunicado: "Comunicado",
  promocao: "Promoção",
}

export function isNewsCategory(value: string | undefined): value is NewsCategory {
  return Boolean(value && NEWS_CATEGORY_OPTIONS.includes(value as NewsCategory))
}

type NewsRow = {
  id: string
  title: string
  description: string
  content: string
  slug: string
  category: NewsCategory
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

export type PaginatedNewsFeed = {
  items: NewsPreview[]
  totalItems: number
  totalPages: number
  page: number
  pageSize: number
}

export function extractNewsImageObjectPath(value: string): string | null {
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

export function resolveCoverImageUrl(
  supabase: PublicSupabaseClient,
  rowCoverImageUrl: string | null
): string | null {
  if (!rowCoverImageUrl) {
    return null
  }

  const objectPath = extractNewsImageObjectPath(rowCoverImageUrl)

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

export async function getFeaturedNews(category?: NewsCategory): Promise<NewsPreview | null> {
  const supabase = createSupabaseServerPublicClient()

  let query = supabase
    .from("news")
    .select("id,title,description,slug,category,cover_image_url,read_time_minutes,is_featured,is_hot,is_active,published_at")
    .eq("is_active", true)
    .eq("is_featured", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(1)

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query.maybeSingle()

  if (error || !data) {
    return null
  }

  return mapPreview(supabase, data as NewsRow)
}

export async function getNewsFeed(limit = 6, category?: NewsCategory): Promise<NewsPreview[]> {
  const supabase = createSupabaseServerPublicClient()

  let query = supabase
    .from("news")
    .select("id,title,description,slug,category,cover_image_url,read_time_minutes,is_featured,is_hot,is_active,published_at")
    .eq("is_active", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit)

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return (data as NewsRow[]).map((row) => mapPreview(supabase, row))
}

export async function getPaginatedNewsFeed(options?: {
  page?: number
  pageSize?: number
  excludeId?: string
  category?: NewsCategory
}): Promise<PaginatedNewsFeed> {
  const supabase = createSupabaseServerPublicClient()

  const requestedPage = Math.max(1, options?.page ?? 1)
  const pageSize = Math.max(1, options?.pageSize ?? 6)
  const from = (requestedPage - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("news")
    .select(
      "id,title,description,slug,category,cover_image_url,read_time_minutes,is_featured,is_hot,is_active,published_at",
      { count: "exact" }
    )
    .eq("is_active", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .range(from, to)

  if (options?.category) {
    query = query.eq("category", options.category)
  }

  if (options?.excludeId) {
    query = query.neq("id", options.excludeId)
  }

  const { data, error, count } = await query

  if (error || !data) {
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      page: requestedPage,
      pageSize,
    }
  }

  const totalItems = count ?? 0
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 0

  return {
    items: (data as NewsRow[]).map((row) => mapPreview(supabase, row)),
    totalItems,
    totalPages,
    page: requestedPage,
    pageSize,
  }
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
