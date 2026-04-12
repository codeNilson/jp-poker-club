import "server-only"

import { createSupabaseServerPublicClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database"

type EventRow = Database["public"]["Tables"]["events"]["Row"]
type EventConfirmationRow = Database["public"]["Tables"]["event_confirmations"]["Row"]
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]

export type EventAttendee = {
  userId: string
  displayName: string
  avatarUrl: string | null
  confirmedAt: string
}

export type PublicEvent = {
  id: string
  title: string
  description: string | null
  eventDate: string
  eventType: Database["public"]["Enums"]["event_type"]
  buyIn: number | null
  blinds: string | null
  maxPlayers: number
  status: Database["public"]["Enums"]["event_status"]
  confirmedCount: number
  availableSeats: number
  attendees: EventAttendee[]
}

function mapEvent(row: EventRow): PublicEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    eventDate: row.event_date,
    eventType: row.event_type,
    buyIn: row.buy_in,
    blinds: row.blinds,
    maxPlayers: row.max_players,
    status: row.status,
    confirmedCount: 0,
    availableSeats: row.max_players,
    attendees: [],
  }
}

export async function getPublicEventsFeed(): Promise<PublicEvent[]> {
  const supabase = createSupabaseServerPublicClient()

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id,title,description,event_date,event_type,buy_in,blinds,max_players,status")
    .order("event_date", { ascending: true })

  if (eventsError || !events) {
    return []
  }

  const items = (events as EventRow[]).map(mapEvent)

  if (items.length === 0) {
    return items
  }

  const eventIds = items.map((item) => item.id)

  const { data: confirmationsData } = await supabase
    .from("event_confirmations")
    .select("event_id,user_id,created_at")
    .in("event_id", eventIds)
    .order("created_at", { ascending: true })

  const confirmations = (confirmationsData ?? []) as EventConfirmationRow[]
  const userIds = Array.from(new Set(confirmations.map((confirmation) => confirmation.user_id)))

  const { data: profilesData } =
    userIds.length > 0
      ? await supabase.from("profiles").select("id,display_name,avatar_url").in("id", userIds)
      : { data: [] as Pick<ProfileRow, "id" | "display_name" | "avatar_url">[] }

  const profileMap = new Map<string, Pick<ProfileRow, "display_name" | "avatar_url">>()

  for (const profile of profilesData ?? []) {
    profileMap.set(profile.id, {
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
    })
  }

  const attendanceMap = new Map<string, EventAttendee[]>()

  for (const confirmation of confirmations) {
    const eventId = confirmation.event_id as string
    const profile = profileMap.get(confirmation.user_id)
    const attendee: EventAttendee = {
      userId: confirmation.user_id,
      displayName:
        typeof profile?.display_name === "string" && profile.display_name.trim().length > 0
          ? profile.display_name
          : "Jogador",
      avatarUrl: typeof profile?.avatar_url === "string" ? profile.avatar_url : null,
      confirmedAt: confirmation.created_at,
    }

    const current = attendanceMap.get(eventId) ?? []
    current.push(attendee)
    attendanceMap.set(eventId, current)
  }

  return items.map((item) => {
    const attendees = attendanceMap.get(item.id) ?? []
    const confirmedCount = attendees.length

    return {
      ...item,
      confirmedCount,
      availableSeats: Math.max(item.maxPlayers - confirmedCount, 0),
      attendees,
    }
  })
}
