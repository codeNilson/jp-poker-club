import Link from "next/link"
import {
  ArrowRightIcon,
  CalendarClockIcon,
  CalendarDaysIcon,
  CircleDollarSignIcon,
  CrownIcon,
  DotIcon,
  UserRoundCheckIcon,
  UsersIcon,
} from "lucide-react"

import { EventRsvpToggle } from "@/components/events/event-rsvp-toggle"
import { Button } from "@/components/ui/button"
import { getPublicEventsFeed } from "@/services/events.service"

export const revalidate = 900

function formatDateTime(value: string) {
  const date = new Date(value)

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function formatEventType(value: "tournament" | "cash_game") {
  return value === "tournament" ? "Torneio" : "Cash game"
}

function formatStatus(value: "upcoming" | "ongoing" | "finished") {
  if (value === "upcoming") {
    return "Inscrições abertas"
  }

  if (value === "ongoing") {
    return "Acontecendo agora"
  }

  return "Encerrado"
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return "Não informado"
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value)
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export default async function EventosPage() {
  const events = await getPublicEventsFeed()
  const totalConfirmed = events.reduce((accumulator, item) => accumulator + item.confirmedCount, 0)
  const openEventsCount = events.filter((item) => item.status !== "finished").length
  const featuredEvent = events.find((item) => item.status !== "finished") ?? events[0] ?? null

  return (
    <section className="relative isolate overflow-hidden px-4 pb-16 sm:px-6 lg:px-8 animate-in fade-in-0 duration-500">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 -top-32 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl sm:h-112 sm:w-md" />
        <div className="absolute -left-24 top-72 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -right-18 top-64 h-64 w-64 rounded-full bg-emerald-500/12 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="relative overflow-hidden rounded-3xl border border-border/80 bg-linear-to-br from-primary/16 via-card to-card p-5 backdrop-blur sm:p-8">
          <div className="absolute right-4 top-4 hidden rounded-2xl border border-primary/35 bg-primary/10 px-4 py-3 text-right sm:block">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Movimento</p>
            <p className="mt-1 text-2xl font-black leading-none">{totalConfirmed}</p>
            <p className="mt-1 text-xs text-muted-foreground">confirmações ativas</p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <CalendarClockIcon className="size-3.5" aria-hidden="true" />
            Agenda viva do clube
          </span>

          <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight tracking-tight text-balance sm:text-5xl">
            Todos os eventos em um só lugar, com presença em tempo real.
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Escolha seu próximo torneio ou cash game, confirme presença com um toque e acompanhe quem já entrou na mesa.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <article className="rounded-2xl border border-border/80 bg-card/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Eventos no radar</p>
              <p className="mt-1 text-2xl font-black">{events.length}</p>
            </article>
            <article className="rounded-2xl border border-border/80 bg-card/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Com inscrição aberta</p>
              <p className="mt-1 text-2xl font-black text-primary">{openEventsCount}</p>
            </article>
            <article className="rounded-2xl border border-border/80 bg-card/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Maior lotação</p>
              <p className="mt-1 text-2xl font-black">
                {featuredEvent ? `${featuredEvent.confirmedCount}/${featuredEvent.maxPlayers}` : "-"}
              </p>
            </article>
          </div>
        </header>

        {events.length === 0 ? (
          <article className="rounded-3xl border border-border/80 bg-card/70 p-6 text-center sm:p-8">
            <h2 className="text-2xl font-black tracking-tight">Sem eventos publicados no momento</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Assim que novos eventos forem criados no painel administrativo, eles aparecem aqui automaticamente.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild className="rounded-full px-5">
                <Link href="/">Voltar para início</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-5">
                <Link href="/noticias">
                  Ver notícias
                  <ArrowRightIcon className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </article>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              {events.map((event, index) => {
                const isTournament = event.eventType === "tournament"
                const isSoldOut = event.availableSeats === 0

                return (
                  <article
                    key={event.id}
                    className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card/70 p-5 transition-[border-color,transform] duration-300 hover:border-primary/50 sm:p-6"
                  >
                    <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 translate-x-4 -translate-y-4 rounded-full bg-primary/8 blur-2xl" />

                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                          {formatStatus(event.status)}
                        </p>
                        <h2 className="mt-3 text-2xl font-black tracking-tight text-balance">{event.title}</h2>
                      </div>

                      <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {event.description ? (
                      <p className="mt-3 text-sm text-muted-foreground sm:text-base">{event.description}</p>
                    ) : null}

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-border/70 bg-muted/35 p-3">
                        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <CalendarDaysIcon className="size-3.5" aria-hidden="true" />
                          Data e hora
                        </p>
                        <p className="mt-2 text-sm font-semibold">{formatDateTime(event.eventDate)}</p>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-muted/35 p-3">
                        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <CrownIcon className="size-3.5" aria-hidden="true" />
                          Modalidade
                        </p>
                        <p className="mt-2 text-sm font-semibold">{formatEventType(event.eventType)}</p>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-muted/35 p-3">
                        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <CircleDollarSignIcon className="size-3.5" aria-hidden="true" />
                          {isTournament ? "Buy-in" : "Blinds"}
                        </p>
                        <p className="mt-2 text-sm font-semibold">
                          {isTournament ? formatCurrency(event.buyIn) : event.blinds ?? "Não informado"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/40 p-3">
                      <div>
                        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <UsersIcon className="size-3.5" aria-hidden="true" />
                          Presenças confirmadas
                        </p>
                        <p className="mt-1 text-lg font-black">
                          {event.confirmedCount} / {event.maxPlayers}
                          <span className="ml-2 text-xs font-medium text-muted-foreground">
                            {isSoldOut ? "Sem vagas" : `${event.availableSeats} vagas restantes`}
                          </span>
                        </p>
                      </div>

                      <EventRsvpToggle eventId={event.id} eventStatus={event.status} isSoldOut={isSoldOut} />
                    </div>

                    <div className="mt-4 rounded-2xl border border-border/70 bg-muted/35 p-3">
                      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <UserRoundCheckIcon className="size-3.5" aria-hidden="true" />
                        Quem confirmou
                      </p>

                      {event.attendees.length > 0 ? (
                        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                          {event.attendees.slice(0, 8).map((attendee) => (
                            <li
                              key={`${event.id}:${attendee.userId}`}
                              className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/70 px-2.5 py-2"
                            >
                              <span className="inline-flex size-7 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-xs font-bold text-primary">
                                {getInitials(attendee.displayName) || "JP"}
                              </span>
                              <span className="truncate text-sm font-medium">{attendee.displayName}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">Ainda ninguém confirmou presença neste evento.</p>
                      )}

                      {event.attendees.length > 8 ? (
                        <p className="mt-2 inline-flex items-center text-xs text-muted-foreground">
                          <DotIcon className="size-4" aria-hidden="true" />
                          e mais {event.attendees.length - 8} pessoas confirmadas
                        </p>
                      ) : null}
                    </div>
                  </article>
                )
              })}
            </div>

            <aside className="lg:sticky lg:top-30">
              <article className="rounded-3xl border border-border/80 bg-card/75 p-5 backdrop-blur sm:p-6">
                <h3 className="text-xl font-black tracking-tight">Pulso de presença</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  As confirmações aparecem em tempo real e ajudam a prever o movimento de cada mesa.
                </p>

                <div className="mt-4 space-y-2">
                  {events
                    .filter((event) => event.status !== "finished")
                    .slice(0, 6)
                    .map((event) => (
                      <div
                        key={`pulse:${event.id}`}
                        className="rounded-2xl border border-border/70 bg-muted/35 px-3 py-2"
                      >
                        <p className="text-sm font-semibold leading-tight">{event.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {event.confirmedCount} confirmados • {event.availableSeats} vagas
                        </p>
                      </div>
                    ))}
                </div>

                <div className="mt-5 rounded-2xl border border-primary/35 bg-primary/10 p-4">
                  <p className="text-sm font-semibold text-primary">Dica</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Faça login para confirmar presença e acompanhar sua agenda de jogo sem sair desta tela.
                  </p>
                </div>
              </article>
            </aside>
          </div>
        )}
      </div>
    </section>
  )
}
