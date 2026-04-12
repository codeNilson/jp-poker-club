"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2Icon, Loader2Icon, LogInIcon, XCircleIcon } from "lucide-react"
import { toast } from "sonner"

import { cancelEventPresenceAction, confirmEventPresenceAction } from "@/app/eventos/actions"
import { Button } from "@/components/ui/button"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type EventRsvpToggleProps = {
  eventId: string
  eventStatus: "upcoming" | "ongoing" | "finished"
  isSoldOut: boolean
}

export function EventRsvpToggle({ eventId, eventStatus, isSoldOut }: EventRsvpToggleProps) {
  const router = useRouter()
  const [supabase] = useState(() => createSupabaseBrowserClient())
  const [isChecking, setIsChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let isMounted = true

    async function resolveSessionAndStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!isMounted) {
        return
      }

      if (!user) {
        setHasSession(false)
        setIsConfirmed(false)
        setIsChecking(false)
        return
      }

      setHasSession(true)

      const { data } = await supabase
        .from("event_confirmations")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .maybeSingle()

      if (!isMounted) {
        return
      }

      setIsConfirmed(Boolean(data?.id))
      setIsChecking(false)
    }

    resolveSessionAndStatus().catch(() => {
      if (!isMounted) {
        return
      }

      setHasSession(false)
      setIsConfirmed(false)
      setIsChecking(false)
    })

    return () => {
      isMounted = false
    }
  }, [eventId, supabase])

  const isEventClosed = eventStatus === "finished"
  const isDisabled = isPending || isChecking || (isSoldOut && !isConfirmed) || isEventClosed

  const label = useMemo(() => {
    if (isChecking) {
      return "Verificando sua presença..."
    }

    if (!hasSession) {
      return "Entrar para confirmar"
    }

    if (isEventClosed) {
      return "Evento encerrado"
    }

    if (isSoldOut && !isConfirmed) {
      return "Sem vagas disponíveis"
    }

    if (isConfirmed) {
      return "Cancelar presença"
    }

    return "Confirmar presença"
  }, [hasSession, isChecking, isConfirmed, isSoldOut, isEventClosed])

  function handleClick() {
    if (!hasSession) {
      router.push("/login")
      return
    }

    startTransition(async () => {
      const actionResult = isConfirmed
        ? await cancelEventPresenceAction({ eventId })
        : await confirmEventPresenceAction({ eventId })

      if (!actionResult.ok) {
        toast.error(actionResult.message)
        return
      }

      setIsConfirmed((current) => !current)
      toast.success(actionResult.message)
      router.refresh()
    })
  }

  return (
    <Button
      type="button"
      className="h-10 rounded-full px-4"
      variant={isConfirmed ? "outline" : "default"}
      disabled={isDisabled}
      onClick={handleClick}
    >
      {isPending || isChecking ? (
        <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
      ) : !hasSession ? (
        <LogInIcon className="size-4" aria-hidden="true" />
      ) : isConfirmed ? (
        <XCircleIcon className="size-4" aria-hidden="true" />
      ) : (
        <CheckCircle2Icon className="size-4" aria-hidden="true" />
      )}
      {label}
    </Button>
  )
}
