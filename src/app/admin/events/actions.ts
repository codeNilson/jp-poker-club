"use server"

import { randomUUID } from "crypto"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { getAdminAccess } from "@/lib/admin/access"
import { isNextRedirectError } from "@/lib/next-redirect"

const eventTypeSchema = z.enum(["tournament", "cash_game"])
const eventStatusSchema = z.enum(["upcoming", "ongoing", "finished"])

const eventFormSchema = z
  .object({
    title: z.string().trim().min(3, "Informe um titulo valido."),
    description: z.string().trim().optional().or(z.literal("")),
    eventDate: z.string().trim().min(1, "Informe a data do evento."),
    eventType: eventTypeSchema,
    buyIn: z.string().trim().optional().or(z.literal("")),
    blinds: z.string().trim().optional().or(z.literal("")),
    maxPlayers: z.coerce.number().int().min(1, "Informe o limite de jogadores."),
    status: eventStatusSchema,
  })
  .superRefine((value, context) => {
    if (value.eventType === "tournament" && !value.buyIn) {
      context.addIssue({ code: "custom", path: ["buyIn"], message: "Torneios exigem buy-in." })
    }

    if (value.eventType === "cash_game" && !value.blinds) {
      context.addIssue({ code: "custom", path: ["blinds"], message: "Cash game exige blinds." })
    }
  })

const eventUpdateSchema = eventFormSchema.extend({
  id: z.string().uuid(),
})

function formatSlugLikeDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString()
  }

  return date.toISOString()
}

function buildRedirectPath(basePath: string, type: "success" | "error", message: string) {
  return `${basePath}?${type}=${encodeURIComponent(message)}`
}

async function assertEventAccess(allowOperator = true) {
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

function normalizeEventPayload(formData: FormData) {
  const rawPayload = {
    title: formData.get("title"),
    description: formData.get("description"),
    eventDate: formData.get("eventDate"),
    eventType: formData.get("eventType"),
    buyIn: formData.get("buyIn"),
    blinds: formData.get("blinds"),
    maxPlayers: formData.get("maxPlayers"),
    status: formData.get("status"),
  }

  return {
    title: typeof rawPayload.title === "string" ? rawPayload.title : "",
    description: typeof rawPayload.description === "string" ? rawPayload.description : "",
    eventDate: typeof rawPayload.eventDate === "string" ? rawPayload.eventDate : "",
    eventType: typeof rawPayload.eventType === "string" ? rawPayload.eventType : "",
    buyIn: typeof rawPayload.buyIn === "string" ? rawPayload.buyIn : "",
    blinds: typeof rawPayload.blinds === "string" ? rawPayload.blinds : "",
    maxPlayers: typeof rawPayload.maxPlayers === "string" ? rawPayload.maxPlayers : 0,
    status: typeof rawPayload.status === "string" ? rawPayload.status : "upcoming",
  }
}

function getValidationErrorMessage(error: z.ZodError) {
  const uniqueMessages = Array.from(new Set(error.issues.map((issue) => issue.message).filter(Boolean)))

  return uniqueMessages.length > 0 ? uniqueMessages.join(" ") : "Dados inválidos. Revise os campos e tente novamente."
}

function normalizeMoney(value: string | undefined | null) {
  if (!value || !value.trim()) {
    return null
  }

  const compactValue = value.trim().replace(/\s/g, "").replace(/R\$/g, "")
  const hasComma = compactValue.includes(",")
  const hasDot = compactValue.includes(".")

  let normalizedValue = compactValue

  if (hasComma && hasDot) {
    normalizedValue = compactValue.replace(/\./g, "").replace(",", ".")
  } else if (hasComma) {
    normalizedValue = compactValue.replace(",", ".")
  } else if (hasDot) {
    const dotGroups = compactValue.split(".")

    if (dotGroups.length > 2) {
      normalizedValue = dotGroups.join("")
    } else {
      const decimalPartLength = dotGroups[1]?.length ?? 0

      if (decimalPartLength !== 1 && decimalPartLength !== 2) {
        normalizedValue = compactValue.replace(/\./g, "")
      }
    }
  }

  const parsedValue = Number(normalizedValue)

  if (Number.isNaN(parsedValue)) {
    return null
  }

  return parsedValue
}

function invalidateEventPaths() {
  revalidatePath("/admin/events")
  revalidatePath("/eventos")
  revalidatePath("/")
  revalidatePath("/noticias")
}

export async function createEventAction(formData: FormData) {
  const { supabase } = await assertEventAccess(true)
  const payloadResult = eventFormSchema.safeParse(normalizeEventPayload(formData))
  const eventId = randomUUID()

  if (!payloadResult.success) {
    redirect(buildRedirectPath("/admin/events", "error", getValidationErrorMessage(payloadResult.error)))
  }

  const payload = payloadResult.data
  const buyIn = payload.eventType === "tournament" ? normalizeMoney(payload.buyIn) : null
  const blinds = payload.eventType === "cash_game" ? payload.blinds?.trim() || null : null

  try {
    const { error } = await supabase.from("events").insert({
      id: eventId,
      title: payload.title,
      description: payload.description || null,
      event_date: formatSlugLikeDate(payload.eventDate),
      buy_in: buyIn,
      max_players: payload.maxPlayers,
      status: payload.status,
      event_type: payload.eventType,
      blinds,
    })

    if (error) {
      throw new Error(error.message)
    }

    invalidateEventPaths()
    redirect(buildRedirectPath("/admin/events", "success", "Evento criado com sucesso."))
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error
    }

    const message = error instanceof Error ? error.message : "Nao foi possivel criar o evento."
    redirect(buildRedirectPath("/admin/events", "error", message))
  }
}

export async function updateEventAction(formData: FormData) {
  const { supabase } = await assertEventAccess(true)
  const payload = eventUpdateSchema.safeParse({
    id: formData.get("id"),
    ...normalizeEventPayload(formData),
  })

  if (!payload.success) {
    redirect(buildRedirectPath("/admin/events", "error", payload.error.issues[0]?.message ?? "Dados invalidos."))
  }

  const currentEventId = payload.data.id
  const buyIn = payload.data.eventType === "tournament" ? normalizeMoney(payload.data.buyIn) : null
  const blinds = payload.data.eventType === "cash_game" ? payload.data.blinds?.trim() || null : null

  try {
    const { error } = await supabase
      .from("events")
      .update({
        title: payload.data.title,
        description: payload.data.description || null,
        event_date: formatSlugLikeDate(payload.data.eventDate),
        buy_in: buyIn,
        max_players: payload.data.maxPlayers,
        status: payload.data.status,
        event_type: payload.data.eventType,
        blinds,
      })
      .eq("id", currentEventId)

    if (error) {
      throw new Error(error.message)
    }

    invalidateEventPaths()
    redirect(buildRedirectPath("/admin/events", "success", "Evento atualizado com sucesso."))
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error
    }

    const message = error instanceof Error ? error.message : "Nao foi possivel atualizar o evento."
    redirect(buildRedirectPath("/admin/events", "error", message))
  }
}

export async function deleteEventAction(formData: FormData) {
  const { supabase, role } = await assertEventAccess(false)
  const id = formData.get("id")

  if (typeof id !== "string" || !id) {
    redirect(buildRedirectPath("/admin/events", "error", "Informe o evento a ser removido."))
  }

  if (role !== "admin") {
    redirect(buildRedirectPath("/admin/events", "error", "Somente admin pode excluir eventos."))
  }

  const { error } = await supabase.from("events").delete().eq("id", id)

  if (error) {
    redirect(buildRedirectPath("/admin/events", "error", error.message))
  }

  invalidateEventPaths()
  redirect(buildRedirectPath("/admin/events", "success", "Evento removido com sucesso."))
}
