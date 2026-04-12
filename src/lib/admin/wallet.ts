import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export type AdminWalletRow = {
  user_id: string
  user_display_name: string | null
  balance: number
  created_at: string
  updated_at: string
}

export type AdminWalletTransactionRow = {
  id: string
  user_id: string
  user_display_name: string | null
  actor_display_name: string | null
  type: "deposit" | "bonus" | "debit" | "refund" | "adjustment"
  amount: number
  balance_before: number
  balance_after: number
  reference_type: string | null
  reference_id: string | null
  description: string | null
  created_at: string
}

async function getDisplayNameMap(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, string>()
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,display_name")
    .in("id", userIds)

  if (error || !data) {
    return new Map<string, string>()
  }

  return new Map(data.map((profile) => [profile.id, profile.display_name]))
}

export async function getAdminWallets() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("wallets")
    .select("user_id,balance,created_at,updated_at")
    .order("updated_at", { ascending: false })

  if (error || !data) {
    return [] as AdminWalletRow[]
  }

  const userIds = Array.from(new Set(data.map((wallet) => wallet.user_id)))
  const displayNameMap = await getDisplayNameMap(supabase, userIds)

  return data.map((wallet) => ({
    ...wallet,
    user_display_name: displayNameMap.get(wallet.user_id) ?? null,
  })) as AdminWalletRow[]
}

export async function getAdminWalletTransactions(limit = 30) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("id,user_id,type,amount,balance_before,balance_after,reference_type,reference_id,description,created_at")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error || !data) {
    return [] as AdminWalletTransactionRow[]
  }

  const userIds = Array.from(new Set(data.map((tx) => tx.user_id)))
  const actorIds = Array.from(
    new Set(
      data
        .filter((tx) => tx.reference_type === "admin_adjustment" && tx.reference_id)
        .map((tx) => tx.reference_id as string)
    )
  )

  const [displayNameMap, actorDisplayNameMap] = await Promise.all([
    getDisplayNameMap(supabase, userIds),
    getDisplayNameMap(supabase, actorIds),
  ])

  return data.map((tx) => ({
    ...tx,
    user_display_name: displayNameMap.get(tx.user_id) ?? null,
    actor_display_name: tx.reference_id ? actorDisplayNameMap.get(tx.reference_id) ?? null : null,
  })) as AdminWalletTransactionRow[]
}
