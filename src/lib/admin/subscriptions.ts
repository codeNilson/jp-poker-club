import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export type AdminSubscriptionRow = {
  user_id: string
  user_display_name: string | null
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

export async function getAdminSubscriptions() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("subscriptions")
    .select("user_id,status,provider,provider_customer_id,provider_subscription_id,current_period_start,current_period_end,canceled_at,created_at,updated_at")
    .order("updated_at", { ascending: false })

  if (error || !data) {
    return [] as AdminSubscriptionRow[]
  }

  const userIds = Array.from(new Set(data.map((subscription) => subscription.user_id)))
  const displayNameMap = await getDisplayNameMap(supabase, userIds)

  return data.map((subscription) => ({
    ...subscription,
    user_display_name: displayNameMap.get(subscription.user_id) ?? null,
  })) as AdminSubscriptionRow[]
}
