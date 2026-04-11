import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export type AdminWalletRow = {
  user_id: string
  balance: number
  created_at: string
  updated_at: string
}

export type AdminWalletTransactionRow = {
  id: string
  user_id: string
  type: "deposit" | "bonus" | "debit" | "refund" | "adjustment"
  amount: number
  balance_before: number
  balance_after: number
  reference_type: string | null
  reference_id: string | null
  description: string | null
  created_at: string
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

  return data as AdminWalletRow[]
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

  return data as AdminWalletTransactionRow[]
}
