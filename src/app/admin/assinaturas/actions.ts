"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { getAdminAccess } from "@/lib/admin/access"

const subscriptionUpdateSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(["inactive", "active", "past_due", "canceled"]),
  currentPeriodStart: z.string().trim().optional().or(z.literal("")),
  currentPeriodEnd: z.string().trim().optional().or(z.literal("")),
  canceledAt: z.string().trim().optional().or(z.literal("")),
})

function buildRedirectPath(basePath: string, type: "success" | "error", message: string) {
  return `${basePath}?${type}=${encodeURIComponent(message)}`
}

async function assertSubscriptionWriteAccess() {
  const access = await getAdminAccess()

  if (!access.user) {
    redirect("/login")
  }

  if (!access.hasAccess || access.role !== "admin") {
    redirect("/")
  }

  return access
}

function parseNullableDate(value: string | undefined | null) {
  if (!value || !value.trim()) {
    return null
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return parsedDate.toISOString()
}

function resolveCanceledAt(status: "inactive" | "active" | "past_due" | "canceled", rawCanceledAt: string | undefined) {
  if (status === "active") {
    return null
  }

  const parsedCanceledAt = parseNullableDate(rawCanceledAt)

  if (status === "canceled") {
    return parsedCanceledAt ?? new Date().toISOString()
  }

  return parsedCanceledAt
}

export async function updateSubscriptionAction(formData: FormData) {
  const { supabase } = await assertSubscriptionWriteAccess()

  const payload = subscriptionUpdateSchema.safeParse({
    userId: formData.get("userId"),
    status: formData.get("status"),
    currentPeriodStart: formData.get("currentPeriodStart"),
    currentPeriodEnd: formData.get("currentPeriodEnd"),
    canceledAt: formData.get("canceledAt"),
  })

  if (!payload.success) {
    redirect(buildRedirectPath("/admin/subscriptions", "error", payload.error.issues[0]?.message ?? "Dados invalidos."))
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: payload.data.status,
      current_period_start: parseNullableDate(payload.data.currentPeriodStart),
      current_period_end: parseNullableDate(payload.data.currentPeriodEnd),
      canceled_at: resolveCanceledAt(payload.data.status, payload.data.canceledAt),
    })
    .eq("user_id", payload.data.userId)

  if (error) {
    redirect(buildRedirectPath("/admin/subscriptions", "error", error.message))
  }

  revalidatePath("/admin/subscriptions")
  revalidatePath("/")
  redirect(buildRedirectPath("/admin/subscriptions", "success", "Assinatura atualizada com sucesso."))
}
