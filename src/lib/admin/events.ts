import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export type AdminEventRow = {
  id: string
  title: string
  description: string | null
  event_date: string
  buy_in: number | null
  max_players: number
  status: string
  event_type: string
  blinds: string | null
  created_at: string
  updated_at: string
}

export async function getAdminEventItems() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("events")
    .select("id,title,description,event_date,buy_in,max_players,status,event_type,blinds,created_at,updated_at")
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error || !data) {
    return [] as AdminEventRow[]
  }

  return data as AdminEventRow[]
}
