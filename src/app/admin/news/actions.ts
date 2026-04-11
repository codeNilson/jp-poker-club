"use server"

import { randomUUID } from "crypto"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { getAdminAccess } from "@/lib/admin/access"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NEWS_CATEGORY_OPTIONS, type NewsCategory } from "@/services/news.service"

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
  coverImageUrl: z.string().trim().optional().or(z.literal("")),
  readTimeMinutes: z.coerce.number().int().min(1).max(60),
  publishedAt: z.string().trim().optional().or(z.literal("")),
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
    coverImageUrl: formData.get("coverImageUrl"),
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
    coverImageUrl: typeof rawPayload.coverImageUrl === "string" ? rawPayload.coverImageUrl : "",
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

function getValidationErrorMessage(error: z.ZodError) {
  const uniqueMessages = Array.from(new Set(error.issues.map((issue) => issue.message).filter(Boolean)))

  if (uniqueMessages.length === 0) {
    return "Dados invalidos. Revise os campos e tente novamente."
  }

  return uniqueMessages.join(" ")
}

function getFriendlyNewsErrorMessage(error: unknown, fallbackMessage: string) {
  if (error && typeof error === "object") {
    const code = "code" in error ? String(error.code) : ""
    const message = "message" in error ? String(error.message) : ""

    if (code === "23505" || message.includes("news_slug_key")) {
      return "Slug duplicado. Escolha outro slug."
    }

    if (message.includes("news_single_active_featured_idx")) {
      return "Ja existe uma noticia ativa em destaque."
    }

    if (code === "42501") {
      return "Voce nao tem permissao para essa acao."
    }
  }

  return fallbackMessage
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
  revalidatePath("/noticias")
  revalidatePath("/noticias/todas")

  if (slug) {
    revalidatePath(`/noticias/${slug}`)
  }
}

export async function createNewsAction(formData: FormData) {
  const { supabase } = await assertNewsAccess(true)
  const payloadResult = newsFormSchema.safeParse(normalizeNewsPayload(formData))

  if (!payloadResult.success) {
    redirect(buildRedirectPath("/admin/news", "error", getValidationErrorMessage(payloadResult.error)))
  }

  const payload = payloadResult.data
  const createdId = randomUUID()
  const createdSlug = payload.slug || slugify(payload.title)
  const nextFeatured = payload.isActive ? payload.isFeatured : false
  let errorMessage: string | null = null

  try {
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
      cover_image_url: payload.coverImageUrl || null,
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
    errorMessage = getFriendlyNewsErrorMessage(error, "Nao foi possivel criar a noticia.")
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

  if (!payload.success) {
    redirect(buildRedirectPath("/admin/news", "error", getValidationErrorMessage(payload.error)))
  }

  const currentId = payload.data.id
  const { data: currentNews, error: currentError } = await supabase
    .from("news")
    .select("slug, is_featured")
    .eq("id", currentId)
    .maybeSingle()

  if (currentError || !currentNews) {
    redirect(buildRedirectPath("/admin/news", "error", "Noticia nao encontrada."))
  }

  const nextSlug = payload.data.slug || slugify(payload.data.title)
  const nextFeatured = payload.data.isActive ? payload.data.isFeatured : false
  let errorMessage: string | null = null

  try {
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
        cover_image_url: payload.data.coverImageUrl || null,
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
  } catch (error) {
    errorMessage = getFriendlyNewsErrorMessage(error, "Nao foi possivel atualizar a noticia.")
  }

  if (errorMessage) {
    redirect(buildRedirectPath("/admin/news", "error", errorMessage))
  }

  invalidateNewsPaths(currentNews.slug)
  if (currentNews.slug !== nextSlug) {
    invalidateNewsPaths(nextSlug)
  }

  redirect(buildRedirectPath("/admin/news", "success", "Noticia atualizada com sucesso."))
}

export async function deleteNewsAction(formData: FormData) {
  const { supabase, role } = await assertNewsAccess(false)
  const id = formData.get("id")

  if (typeof id !== "string" || !id) {
    redirect(buildRedirectPath("/admin/news", "error", "Informe a noticia que sera removida."))
  }

  const { data: currentNews, error: currentError } = await supabase
    .from("news")
    .select("slug")
    .eq("id", id)
    .maybeSingle()

  if (currentError || !currentNews) {
    redirect(buildRedirectPath("/admin/news", "error", "Noticia nao encontrada."))
  }

  if (role !== "admin") {
    redirect(buildRedirectPath("/admin/news", "error", "Somente admin pode excluir noticias."))
  }

  const { error } = await supabase.from("news").delete().eq("id", id)

  if (error) {
    redirect(buildRedirectPath("/admin/news", "error", getFriendlyNewsErrorMessage(error, "Nao foi possivel remover a noticia.")))
  }

  invalidateNewsPaths(currentNews.slug)
  redirect(buildRedirectPath("/admin/news", "success", "Noticia removida com sucesso."))
}
