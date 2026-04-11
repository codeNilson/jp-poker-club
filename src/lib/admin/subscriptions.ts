import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export type AdminSubscriptionRow = {
  user_id: string
  status: "inactive" | "active" | "past_due" | "canceled"
  provider: string
  provider_customer_id: string | null
  provider_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  canceled_at: string | null
  created_at: string
  updated_at: string
}

export async function getAdminSubscriptions() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("subscriptions")
    .select("user_id,status,provider,provider_customer_id,provider_subscription_id,current_period_start,current_period_end,canceled_at,created_at,updated_at")
    .order("updated_at", { ascending: false })

  if (error || !data) {
    return [] as AdminSubscriptionRow[]
  }

  return data as AdminSubscriptionRow[]
}
