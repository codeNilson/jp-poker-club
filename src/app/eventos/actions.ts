"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createSupabaseServerClient } from "@/lib/supabase/server"

const eventIdSchema = z.object({
  eventId: z.string().uuid(),
})

export type EventConfirmationActionState = {
  ok: boolean
  message: string
}

function fail(message: string): EventConfirmationActionState {
  return { ok: false, message }
}

export async function confirmEventPresenceAction(input: {
  eventId: string
}): Promise<EventConfirmationActionState> {
  const parsed = eventIdSchema.safeParse(input)

  if (!parsed.success) {
    return fail("Evento inválido.")
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return fail("Faça login para confirmar presença.")
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id,status,max_players")
    .eq("id", parsed.data.eventId)
    .maybeSingle()

  if (eventError || !event) {
    return fail("Evento não encontrado.")
  }

  if (event.status === "finished") {
    return fail("Este evento já foi encerrado.")
  }

  const { count: currentCount } = await supabase
    .from("event_confirmations")
    .select("id", { count: "exact", head: true })
    .eq("event_id", event.id)

  if (typeof currentCount === "number" && currentCount >= event.max_players) {
    return fail("Este evento está sem vagas no momento.")
  }

  const { error } = await supabase.from("event_confirmations").insert({
    event_id: event.id,
    user_id: user.id,
  })

  if (error) {
    if (error.code === "23505") {
      return fail("Você já confirmou presença neste evento.")
    }

    return fail("Não foi possível confirmar presença agora. Tente novamente.")
  }

  revalidatePath("/eventos")

  return {
    ok: true,
    message: "Presença confirmada com sucesso.",
  }
}

export async function cancelEventPresenceAction(input: {
  eventId: string
}): Promise<EventConfirmationActionState> {
  const parsed = eventIdSchema.safeParse(input)

  if (!parsed.success) {
    return fail("Evento inválido.")
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return fail("Faça login para cancelar a confirmação.")
  }

  const { error } = await supabase
    .from("event_confirmations")
    .delete()
    .eq("event_id", parsed.data.eventId)
    .eq("user_id", user.id)

  if (error) {
    return fail("Não foi possível cancelar sua confirmação agora.")
  }

  revalidatePath("/eventos")

  return {
    ok: true,
    message: "Confirmação cancelada.",
  }
}
