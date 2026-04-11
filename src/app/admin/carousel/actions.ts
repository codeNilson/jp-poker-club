"use server"

import { randomUUID } from "crypto"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { getAdminAccess } from "@/lib/admin/access"
import { isNextRedirectError } from "@/lib/next-redirect"

const carouselFormSchema = z.object({
  title: z.string().trim().min(3, "Informe um titulo valido."),
  description: z.string().trim().optional().or(z.literal("")),
  desktopImageUrl: z.string().trim().url("Informe uma URL valida para desktop."),
  mobileImageUrl: z.string().trim().url("Informe uma URL valida para mobile."),
  actionText: z.string().trim().min(2, "Informe o texto do botao."),
  linkUrl: z.string().trim().min(1, "Informe o destino do card."),
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
})

const carouselUpdateSchema = carouselFormSchema.extend({
  id: z.string().uuid(),
})

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1"
}

function buildRedirectPath(basePath: string, type: "success" | "error", message: string) {
  return `${basePath}?${type}=${encodeURIComponent(message)}`
}

async function assertCarouselAccess(allowOperator = true) {
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

function normalizeCarouselPayload(formData: FormData) {
  return {
    title: typeof formData.get("title") === "string" ? formData.get("title") : "",
    description: typeof formData.get("description") === "string" ? formData.get("description") : "",
    desktopImageUrl: typeof formData.get("desktopImageUrl") === "string" ? formData.get("desktopImageUrl") : "",
    mobileImageUrl: typeof formData.get("mobileImageUrl") === "string" ? formData.get("mobileImageUrl") : "",
    actionText: typeof formData.get("actionText") === "string" ? formData.get("actionText") : "",
    linkUrl: typeof formData.get("linkUrl") === "string" ? formData.get("linkUrl") : "",
    sortOrder: typeof formData.get("sortOrder") === "string" ? formData.get("sortOrder") : 0,
    isActive: parseBoolean(formData.get("isActive")),
  }
}

function getValidationErrorMessage(error: z.ZodError) {
  const uniqueMessages = Array.from(new Set(error.issues.map((issue) => issue.message).filter(Boolean)))

  return uniqueMessages.length > 0 ? uniqueMessages.join(" ") : "Dados inválidos. Revise os campos e tente novamente."
}

function invalidateCarouselPaths() {
  revalidatePath("/admin/carousel")
  revalidatePath("/")
}

export async function createCarouselItemAction(formData: FormData) {
  const { supabase } = await assertCarouselAccess(true)
  const payloadResult = carouselFormSchema.safeParse(normalizeCarouselPayload(formData))

  if (!payloadResult.success) {
    redirect(buildRedirectPath("/admin/carousel", "error", getValidationErrorMessage(payloadResult.error)))
  }

  const payload = payloadResult.data

  try {
    const { error } = await supabase.from("carousel_items").insert({
      id: randomUUID(),
      title: payload.title,
      description: payload.description || null,
      desktop_image_url: payload.desktopImageUrl,
      mobile_image_url: payload.mobileImageUrl,
      action_text: payload.actionText,
      link_url: payload.linkUrl,
      is_active: payload.isActive,
      sort_order: payload.sortOrder,
    })

    if (error) {
      throw new Error(error.message)
    }

    invalidateCarouselPaths()
    redirect(buildRedirectPath("/admin/carousel", "success", "Card do carousel criado com sucesso."))
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error
    }

    const message = error instanceof Error ? error.message : "Nao foi possivel criar o card do carousel."
    redirect(buildRedirectPath("/admin/carousel", "error", message))
  }
}

export async function updateCarouselItemAction(formData: FormData) {
  const { supabase } = await assertCarouselAccess(true)
  const payload = carouselUpdateSchema.safeParse({
    id: formData.get("id"),
    ...normalizeCarouselPayload(formData),
  })

  if (!payload.success) {
    redirect(buildRedirectPath("/admin/carousel", "error", payload.error.issues[0]?.message ?? "Dados invalidos."))
  }

  try {
    const { error } = await supabase
      .from("carousel_items")
      .update({
        title: payload.data.title,
        description: payload.data.description || null,
        desktop_image_url: payload.data.desktopImageUrl,
        mobile_image_url: payload.data.mobileImageUrl,
        action_text: payload.data.actionText,
        link_url: payload.data.linkUrl,
        is_active: payload.data.isActive,
        sort_order: payload.data.sortOrder,
      })
      .eq("id", payload.data.id)

    if (error) {
      throw new Error(error.message)
    }

    invalidateCarouselPaths()
    redirect(buildRedirectPath("/admin/carousel", "success", "Card do carousel atualizado com sucesso."))
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error
    }

    const message = error instanceof Error ? error.message : "Nao foi possivel atualizar o card do carousel."
    redirect(buildRedirectPath("/admin/carousel", "error", message))
  }
}

export async function deleteCarouselItemAction(formData: FormData) {
  const { supabase, role } = await assertCarouselAccess(false)
  const id = formData.get("id")

  if (typeof id !== "string" || !id) {
    redirect(buildRedirectPath("/admin/carousel", "error", "Informe o card que sera removido."))
  }

  if (role !== "admin") {
    redirect(buildRedirectPath("/admin/carousel", "error", "Somente admin pode excluir cards do carousel."))
  }

  const { error } = await supabase.from("carousel_items").delete().eq("id", id)

  if (error) {
    redirect(buildRedirectPath("/admin/carousel", "error", error.message))
  }

  invalidateCarouselPaths()
  redirect(buildRedirectPath("/admin/carousel", "success", "Card do carousel removido com sucesso."))
}
