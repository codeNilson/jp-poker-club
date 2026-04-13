"use server"

import { randomUUID } from "crypto"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { getAdminAccess } from "@/lib/admin/access"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  extractNewsImageObjectPath,
  NEWS_CATEGORY_OPTIONS,
  NEWS_IMAGES_BUCKET,
  type NewsCategory,
} from "@/services/news.service"

const MAX_NEWS_COVER_IMAGE_BYTES = 8 * 1024 * 1024
const SHOULD_THROW_NEWS_ADMIN_ERRORS = process.env.NODE_ENV !== "production"

const newsFormSchema = z.object({
  title: z.string().trim().min(3, "Informe um titulo valido."),
  description: z.string().trim().min(10, "Informe uma chamada valida."),
  content: z.string().trim().min(20, "Escreva um conteudo mais completo."),
  slug: z
    .string()
    .trim()
    .min(3, "Informe um slug valido.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, numeros e hifens."),
  category: z.enum(NEWS_CATEGORY_OPTIONS),
  readTimeMinutes: z.coerce.number().int().min(1).max(60),
  publishedAt: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => value === undefined || value === "" || !Number.isNaN(new Date(value).getTime()),
      "Informe uma data de publicação valida."
    ),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  isHot: z.boolean(),
})

const newsUpdateSchema = newsFormSchema.extend({
  id: z.string().uuid(),
})

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1"
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function buildRedirectPath(basePath: string, type: "success" | "error", message: string) {
  return `${basePath}?${type}=${encodeURIComponent(message)}`
}

async function assertNewsAccess(allowOperator = true) {
  const access = await getAdminAccess()

  if (!access.user) {
    redirect("/login")
  }

  if (!access.hasAccess) {
    redirect("/")
  }

  if (!allowOperator && access.role !== "admin") {
    redirect("/")
  }

  return access
}

function parsePublishedAt(rawValue: string | null | undefined) {
  if (!rawValue) {
    return new Date().toISOString()
  }

  const parsedDate = new Date(rawValue)

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date().toISOString()
  }

  return parsedDate.toISOString()
}

function normalizeNewsPayload(formData: FormData) {
  const rawPayload = {
    title: formData.get("title"),
    description: formData.get("description"),
    content: formData.get("content"),
    slug: formData.get("slug"),
    category: formData.get("category"),
    readTimeMinutes: formData.get("readTimeMinutes"),
    publishedAt: formData.get("publishedAt"),
    isActive: parseBoolean(formData.get("isActive")),
    isFeatured: parseBoolean(formData.get("isFeatured")),
    isHot: parseBoolean(formData.get("isHot")),
  }

  const sanitizedPayload = {
    title: typeof rawPayload.title === "string" ? rawPayload.title : "",
    description: typeof rawPayload.description === "string" ? rawPayload.description : "",
    content: typeof rawPayload.content === "string" ? rawPayload.content : "",
    slug: "",
    category: typeof rawPayload.category === "string" ? rawPayload.category : "",
    readTimeMinutes: typeof rawPayload.readTimeMinutes === "string" ? rawPayload.readTimeMinutes : "",
    publishedAt: typeof rawPayload.publishedAt === "string" ? rawPayload.publishedAt : "",
    isActive: rawPayload.isActive,
    isFeatured: rawPayload.isFeatured,
    isHot: rawPayload.isHot,
  }

  sanitizedPayload.slug =
    typeof rawPayload.slug === "string" && rawPayload.slug.trim()
      ? slugify(rawPayload.slug)
      : slugify(sanitizedPayload.title)

  return {
    ...sanitizedPayload,
    category: sanitizedPayload.category as NewsCategory,
  }
}

function getCoverImageFile(formData: FormData) {
  const value = formData.get("coverImageFile")

  if (value instanceof File && value.size > 0) {
    return value
  }

  return null
}

function getCoverImageExtension(file: File) {
  const mimeTypeToExtension: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
  }

  if (mimeTypeToExtension[file.type]) {
    return mimeTypeToExtension[file.type]
  }

  const filenameExtension = file.name.match(/\.[a-z0-9]+$/i)?.[0].toLowerCase()
  return filenameExtension || ".png"
}

function validateCoverImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    return "A imagem de capa precisa ser um arquivo de imagem."
  }

  if (file.size > MAX_NEWS_COVER_IMAGE_BYTES) {
    return "A imagem de capa pode ter no máximo 8 MB."
  }

  return null
}

type StorageClient = Awaited<ReturnType<typeof createSupabaseServerClient>>
async function uploadNewsCoverImage(file: File, slug: string, sessionSupabase: StorageClient) {
  const validationError = validateCoverImageFile(file)

  if (validationError) {
    throw new Error(validationError)
  }

  const objectPath = `news/${slug}/${randomUUID()}${getCoverImageExtension(file)}`

  const { error } = await sessionSupabase.storage.from(NEWS_IMAGES_BUCKET).upload(objectPath, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  })

  if (error) {
    throw new Error(error.message)
  }

  return `${NEWS_IMAGES_BUCKET}/${objectPath}`
}

async function deleteStoredNewsImage(sessionSupabase: StorageClient, storedValue?: string | null) {
  const objectPath = storedValue ? extractNewsImageObjectPath(storedValue) : null

  if (!objectPath) {
    return
  }

  const { error } = await sessionSupabase.storage.from(NEWS_IMAGES_BUCKET).remove([objectPath])

  if (error) {
    throw new Error(error.message)
  }
}

function getValidationErrorMessage(error: z.ZodError) {
  const uniqueMessages = Array.from(new Set(error.issues.map((issue) => issue.message).filter(Boolean)))

  if (uniqueMessages.length === 0) {
    return "Dados inválidos. Revise os campos e tente novamente."
  }

  return uniqueMessages.join(" ")
}

function getFriendlyNewsErrorMessage(error: unknown, fallbackMessage: string) {
  if (error && typeof error === "object") {
    const code = "code" in error ? String(error.code) : ""
    const message = "message" in error ? String(error.message) : ""

    if (message.includes("Bucket not found") || message.includes("bucket")) {
      return "O storage de imagens não está configurado corretamente."
    }

    if (message.includes("upload") || message.includes("storage")) {
      return "Não foi possível enviar a imagem de capa."
    }

    if (code === "23505" || message.includes("news_slug_key")) {
      return "Slug duplicado. Escolha outro slug."
    }

    if (message.includes("news_single_active_featured_idx")) {
      return "Já existe uma notícia ativa em destaque."
    }

    if (code === "42501") {
      return "Você não tem permissão para essa ação."
    }
  }

  return fallbackMessage
}

function rethrowNewsAdminError(error: unknown): never {
  if (error instanceof Error) {
    throw error
  }

  throw new Error(typeof error === "string" ? error : "Erro inesperado em news admin.")
}

async function clearFeaturedNews(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, currentId?: string) {
  const query = supabase.from("news").update({ is_featured: false }).eq("is_featured", true)

  if (currentId) {
    query.neq("id", currentId)
  }

  const { error } = await query

  if (error) {
    throw new Error(error.message)
  }
}

function invalidateNewsPaths(slug?: string | null) {
  revalidatePath("/admin/news")
  revalidatePath("/")
  revalidatePath("/noticias/todas")

  if (slug) {
    revalidatePath(`/noticias/${slug}`)
  }
}

export async function createNewsAction(formData: FormData) {
  const { supabase } = await assertNewsAccess(true)
  const payloadResult = newsFormSchema.safeParse(normalizeNewsPayload(formData))
  const coverImageFile = getCoverImageFile(formData)

  if (!payloadResult.success) {
    redirect(buildRedirectPath("/admin/news", "error", getValidationErrorMessage(payloadResult.error)))
  }

  const payload = payloadResult.data
  const createdId = randomUUID()
  const createdSlug = payload.slug || slugify(payload.title)
  const nextFeatured = payload.isActive ? payload.isFeatured : false
  let errorMessage: string | null = null
  let uploadedCoverImageUrl: string | null = null

  try {
    if (coverImageFile) {
      uploadedCoverImageUrl = await uploadNewsCoverImage(coverImageFile, createdSlug, supabase)
    }

    if (nextFeatured) {
      await clearFeaturedNews(supabase)
    }

    const { error } = await supabase.from("news").insert({
      id: createdId,
      title: payload.title,
      description: payload.description,
      content: payload.content,
      slug: createdSlug,
      category: payload.category,
      cover_image_url: uploadedCoverImageUrl,
      read_time_minutes: payload.readTimeMinutes,
      is_featured: nextFeatured,
      is_hot: payload.isHot,
      is_active: payload.isActive,
      published_at: parsePublishedAt(payload.publishedAt),
    })

    if (error) {
      throw error
    }
  } catch (error) {
    console.error("[admin/news/create]", error)

    if (SHOULD_THROW_NEWS_ADMIN_ERRORS) {
      rethrowNewsAdminError(error)
    }

    if (uploadedCoverImageUrl) {
      await deleteStoredNewsImage(supabase, uploadedCoverImageUrl).catch(() => undefined)
    }

    errorMessage = getFriendlyNewsErrorMessage(error, "Não foi possível criar a notícia.")
  }

  if (errorMessage) {
    redirect(buildRedirectPath("/admin/news", "error", errorMessage))
  }

  invalidateNewsPaths(createdSlug)
  redirect(buildRedirectPath("/admin/news", "success", "Noticia criada com sucesso."))
}

export async function updateNewsAction(formData: FormData) {
  const { supabase } = await assertNewsAccess(true)
  const payload = newsUpdateSchema.safeParse({
    ...normalizeNewsPayload(formData),
    id: formData.get("id"),
  })
  const coverImageFile = getCoverImageFile(formData)

  if (!payload.success) {
    redirect(buildRedirectPath("/admin/news", "error", getValidationErrorMessage(payload.error)))
  }

  const currentId = payload.data.id
  const { data: currentNews, error: currentError } = await supabase
    .from("news")
    .select("slug, is_featured, cover_image_url")
    .eq("id", currentId)
    .maybeSingle()

  if (currentError || !currentNews) {
    redirect(buildRedirectPath("/admin/news", "error", "Notícia não encontrada."))
  }

  const nextSlug = payload.data.slug || slugify(payload.data.title)
  const nextFeatured = payload.data.isActive ? payload.data.isFeatured : false
  let errorMessage: string | null = null
  let uploadedCoverImageUrl: string | null = null

  try {
    if (coverImageFile) {
      uploadedCoverImageUrl = await uploadNewsCoverImage(coverImageFile, nextSlug, supabase)
    }

    if (nextFeatured) {
      await clearFeaturedNews(supabase, currentId)
    }

    const { error } = await supabase
      .from("news")
      .update({
        title: payload.data.title,
        description: payload.data.description,
        content: payload.data.content,
        slug: nextSlug,
        category: payload.data.category,
        cover_image_url: uploadedCoverImageUrl ?? currentNews.cover_image_url,
        read_time_minutes: payload.data.readTimeMinutes,
        is_featured: nextFeatured,
        is_hot: payload.data.isHot,
        is_active: payload.data.isActive,
        published_at: parsePublishedAt(payload.data.publishedAt),
      })
      .eq("id", currentId)

    if (error) {
      throw error
    }

    if (uploadedCoverImageUrl && currentNews.cover_image_url) {
      await deleteStoredNewsImage(supabase, currentNews.cover_image_url).catch(() => undefined)
    }
  } catch (error) {
    console.error("[admin/news/update]", error)

    if (SHOULD_THROW_NEWS_ADMIN_ERRORS) {
      rethrowNewsAdminError(error)
    }

    if (uploadedCoverImageUrl) {
      await deleteStoredNewsImage(supabase, uploadedCoverImageUrl).catch(() => undefined)
    }

    errorMessage = getFriendlyNewsErrorMessage(error, "Não foi possível atualizar a notícia.")
  }

  if (errorMessage) {
    redirect(buildRedirectPath("/admin/news", "error", errorMessage))
  }

  invalidateNewsPaths(currentNews.slug)
  if (currentNews.slug !== nextSlug) {
    invalidateNewsPaths(nextSlug)
  }

  redirect(buildRedirectPath("/admin/news", "success", "Notícia atualizada com sucesso."))
}

export async function deleteNewsAction(formData: FormData) {
  const { supabase, role } = await assertNewsAccess(false)
  const id = formData.get("id")

  if (typeof id !== "string" || !id) {
    redirect(buildRedirectPath("/admin/news", "error", "Informe a notícia que será removida."))
  }

  const { data: currentNews, error: currentError } = await supabase
    .from("news")
    .select("slug, cover_image_url")
    .eq("id", id)
    .maybeSingle()

  if (currentError || !currentNews) {
    redirect(buildRedirectPath("/admin/news", "error", "Notícia não encontrada."))
  }

  if (role !== "admin") {
    redirect(buildRedirectPath("/admin/news", "error", "Somente admin pode excluir notícias."))
  }

  const { error } = await supabase.from("news").delete().eq("id", id)

  if (error) {
    redirect(buildRedirectPath("/admin/news", "error", getFriendlyNewsErrorMessage(error, "Não foi possível remover a notícia.")))
  }

  if (currentNews.cover_image_url) {
    await deleteStoredNewsImage(supabase, currentNews.cover_image_url).catch(() => undefined)
  }

  invalidateNewsPaths(currentNews.slug)
  redirect(buildRedirectPath("/admin/news", "success", "Notícia removida com sucesso."))
}
