import "server-only"

import { createSupabaseServerPublicClient } from "@/lib/supabase/server"

export type RadarItem = {
  id: string
  title: string
  date: string
  kind: "event" | "news"
}

export async function getRadarWeekItems(limit = 3): Promise<RadarItem[]> {
  const supabase = createSupabaseServerPublicClient()
  const weekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [eventsResult, newsResult] = await Promise.all([
    supabase
      .from("events")
      .select("id,title,event_date,status")
      .in("status", ["upcoming", "ongoing"])
      .order("event_date", { ascending: true })
      .limit(Math.max(limit, 5)),
    supabase
      .from("news")
      .select("id,title,published_at")
      .gte("published_at", weekAgoIso)
      .eq("is_active", true)
      .order("published_at", { ascending: false })
      .limit(Math.max(limit, 5)),
  ])

  const eventItems: RadarItem[] = (eventsResult.data ?? []).map((event) => ({
    id: `event:${event.id}`,
    title: event.title,
    date: event.event_date,
    kind: "event",
  }))

  const newsItems: RadarItem[] = (newsResult.data ?? []).map((news) => ({
    id: `news:${news.id}`,
    title: news.title,
    date: news.published_at,
    kind: "news",
  }))

  return [...eventItems, ...newsItems]
    .sort((a, b) => {
      const aDistance = Math.abs(new Date(a.date).getTime() - Date.now())
      const bDistance = Math.abs(new Date(b.date).getTime() - Date.now())
      return aDistance - bDistance
    })
    .slice(0, limit)
}
