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

export type PaginatedPublicEventsFeed = {
  items: PublicEvent[]
  totalItems: number
  totalPages: number
  page: number
  pageSize: number
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
  const paginated = await getPaginatedPublicEventsFeed({ page: 1, pageSize: 100 })
  return paginated.items
}

export async function getPaginatedPublicEventsFeed(options?: {
  page?: number
  pageSize?: number
}): Promise<PaginatedPublicEventsFeed> {
  const supabase = createSupabaseServerPublicClient()
  const requestedPage = Math.max(1, options?.page ?? 1)
  const pageSize = Math.max(1, options?.pageSize ?? 6)
  const from = (requestedPage - 1) * pageSize
  const to = from + pageSize - 1

  const { data: events, error: eventsError, count } = await supabase
    .from("events")
    .select("id,title,description,event_date,event_type,buy_in,blinds,max_players,status", { count: "exact" })
    .in("status", ["upcoming", "ongoing"])
    .order("event_date", { ascending: true })
    .range(from, to)

  if (eventsError || !events) {
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      page: 1,
      pageSize,
    }
  }

  const items = (events as EventRow[]).map(mapEvent)
  const totalItems = Math.max(0, count ?? 0)
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize)
  const page = totalPages === 0 ? 1 : Math.min(requestedPage, totalPages)

  if (items.length === 0) {
    return {
      items,
      totalItems,
      totalPages,
      page,
      pageSize,
    }
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

  const paginatedItems = items.map((item) => {
    const attendees = attendanceMap.get(item.id) ?? []
    const confirmedCount = attendees.length

    return {
      ...item,
      confirmedCount,
      availableSeats: Math.max(item.maxPlayers - confirmedCount, 0),
      attendees,
    }
  })

  return {
    items: paginatedItems,
    totalItems,
    totalPages,
    page,
    pageSize,
  }
}
