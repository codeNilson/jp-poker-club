"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { getAdminAccess } from "@/lib/admin/access"

const walletAdjustmentSchema = z.object({
  userId: z.string().uuid(),
  amount: z.coerce.number().refine((value) => value !== 0, "Informe um valor diferente de zero."),
  reason: z.string().trim().optional().or(z.literal("")),
})

function buildRedirectPath(basePath: string, type: "success" | "error", message: string) {
  return `${basePath}?${type}=${encodeURIComponent(message)}`
}

async function assertWalletWriteAccess() {
  const access = await getAdminAccess()

  if (!access.user) {
    redirect("/login")
  }

  if (!access.hasAccess || access.role !== "admin") {
    redirect("/")
  }

  return access
}

export async function adjustWalletBalanceAction(formData: FormData) {
  const { supabase } = await assertWalletWriteAccess()

  const payload = walletAdjustmentSchema.safeParse({
    userId: formData.get("userId"),
    amount: formData.get("amount"),
    reason: formData.get("reason"),
  })

  if (!payload.success) {
    redirect(buildRedirectPath("/admin/wallet", "error", payload.error.issues[0]?.message ?? "Dados invalidos."))
  }

  const { error } = await supabase.rpc("admin_adjust_wallet_balance", {
    target_user_id: payload.data.userId,
    adjustment_amount: payload.data.amount,
    adjustment_reason: payload.data.reason || undefined,
  })

  if (error) {
    redirect(buildRedirectPath("/admin/wallet", "error", error.message))
  }

  revalidatePath("/admin/wallet")
  redirect(buildRedirectPath("/admin/wallet", "success", "Ajuste de carteira aplicado com sucesso."))
}
