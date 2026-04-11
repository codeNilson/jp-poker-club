import Link from "next/link"

import { Button } from "@/components/ui/button"
import { getAdminEventItems } from "@/lib/admin/events"

import { createEventAction, deleteEventAction, updateEventAction } from "./actions"

type SearchParams = {
  success?: string | string[]
  error?: string | string[]
}

function formatDateTimeLocal(value: string) {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function parseNotice(searchParams: SearchParams) {
  const successParam = Array.isArray(searchParams.success) ? searchParams.success[0] : searchParams.success
  const errorParam = Array.isArray(searchParams.error) ? searchParams.error[0] : searchParams.error

  if (errorParam) {
    return { type: "error" as const, message: errorParam }
  }

  if (successParam) {
    return { type: "success" as const, message: successParam }
  }

  return null
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {})
  const notice = parseNotice(resolvedSearchParams)
  const eventItems = await getAdminEventItems()
  const nowIso = new Date().toISOString()

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-3xl border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-primary">Admin / Events</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Gerenciar eventos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cadastre torneios e cash games no mesmo calendário, com validação por tipo.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">Voltar ao painel</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/eventos">Ver página pública</Link>
          </Button>
        </div>
      </header>

      {notice ? (
        <div
          className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
            notice.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {notice.message}
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-3xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Novo evento</h2>
          <form action={createEventAction} className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="create-title" className="text-sm font-medium">
                Título
              </label>
              <input id="create-title" name="title" required minLength={3} className="rounded-xl border bg-background px-3 py-2 text-sm" />
              <p className="text-xs text-muted-foreground">Minimo de 3 caracteres.</p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-description" className="text-sm font-medium">
                Descrição
              </label>
              <textarea id="create-description" name="description" rows={3} minLength={10} className="rounded-xl border bg-background px-3 py-2 text-sm" />
              <p className="text-xs text-muted-foreground">Opcional, mas quando preenchida use pelo menos 10 caracteres.</p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-eventType" className="text-sm font-medium">
                Tipo
              </label>
              <select id="create-eventType" name="eventType" defaultValue="tournament" className="rounded-xl border bg-background px-3 py-2 text-sm">
                <option value="tournament">Torneio</option>
                <option value="cash_game">Cash game</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-buyIn" className="text-sm font-medium">
                Buy-in (torneio)
              </label>
              <input id="create-buyIn" name="buyIn" type="number" min="0" step="0.01" className="rounded-xl border bg-background px-3 py-2 text-sm" />
              <p className="text-xs text-muted-foreground">Obrigatório para torneios. Em cash game, deixe vazio.</p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-blinds" className="text-sm font-medium">
                Blinds (cash game)
              </label>
              <input id="create-blinds" name="blinds" placeholder="1/2" className="rounded-xl border bg-background px-3 py-2 text-sm" />
              <p className="text-xs text-muted-foreground">Obrigatório para cash game. Em torneios, deixe vazio.</p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-maxPlayers" className="text-sm font-medium">
                Máximo de jogadores
              </label>
              <input id="create-maxPlayers" name="maxPlayers" type="number" min="1" defaultValue={10} className="rounded-xl border bg-background px-3 py-2 text-sm" />
              <p className="text-xs text-muted-foreground">Use um número inteiro maior que zero.</p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-status" className="text-sm font-medium">
                Status
              </label>
              <select id="create-status" name="status" defaultValue="upcoming" className="rounded-xl border bg-background px-3 py-2 text-sm">
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="finished">Finished</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-eventDate" className="text-sm font-medium">
                Data do evento
              </label>
              <input id="create-eventDate" name="eventDate" type="datetime-local" defaultValue={nowIso.slice(0, 16)} className="rounded-xl border bg-background px-3 py-2 text-sm" />
              <p className="text-xs text-muted-foreground">Informe a data e hora do evento.</p>
            </div>

            <Button type="submit" className="w-full">
              Criar evento
            </Button>
          </form>
        </section>

        <section className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Eventos cadastrados</h2>
            <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
              {eventItems.length} itens
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {eventItems.length > 0 ? (
              eventItems.map((item) => {
                const isTournament = item.event_type === "tournament"

                return (
                  <article key={item.id} className="rounded-3xl border p-5">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                      <span className="rounded-full border px-2.5 py-1 text-foreground">{item.event_type}</span>
                      <span>{formatDisplayDate(item.event_date)}</span>
                      <span>Status: {item.status}</span>
                      <span>Jogadores: {item.max_players}</span>
                      <span>{isTournament ? `Buy-in: ${item.buy_in ?? 0}` : `Blinds: ${item.blinds ?? "-"}`}</span>
                    </div>

                    <h3 className="mt-3 text-xl font-semibold leading-tight">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description ?? "Sem descricao."}</p>

                    <details className="mt-5 rounded-2xl border bg-background p-4">
                      <summary className="cursor-pointer text-sm font-medium">Editar evento</summary>

                      <form action={updateEventAction} className="mt-4 grid gap-4">
                        <input type="hidden" name="id" value={item.id} />

                        <div className="grid gap-2">
                          <label htmlFor={`title-${item.id}`} className="text-sm font-medium">
                              Título
                          </label>
                            <input id={`title-${item.id}`} name="title" required minLength={3} defaultValue={item.title} className="rounded-xl border bg-card px-3 py-2 text-sm" />
                            <p className="text-xs text-muted-foreground">Minimo de 3 caracteres.</p>
                        </div>

                        <div className="grid gap-2">
                          <label htmlFor={`description-${item.id}`} className="text-sm font-medium">
                              Descrição
                          </label>
                            <textarea id={`description-${item.id}`} name="description" rows={3} minLength={10} defaultValue={item.description ?? ""} className="rounded-xl border bg-card px-3 py-2 text-sm" />
                            <p className="text-xs text-muted-foreground">Opcional, mas quando preenchida use pelo menos 10 caracteres.</p>
                        </div>

                        <div className="grid gap-2">
                          <label htmlFor={`eventType-${item.id}`} className="text-sm font-medium">
                            Tipo
                          </label>
                          <select id={`eventType-${item.id}`} name="eventType" defaultValue={item.event_type} className="rounded-xl border bg-card px-3 py-2 text-sm">
                            <option value="tournament">Torneio</option>
                            <option value="cash_game">Cash game</option>
                          </select>
                        </div>

                        <div className="grid gap-2">
                          <label htmlFor={`buyIn-${item.id}`} className="text-sm font-medium">
                            Buy-in (torneio)
                          </label>
                          <input id={`buyIn-${item.id}`} name="buyIn" type="number" min="0" step="0.01" defaultValue={item.buy_in ?? ""} className="rounded-xl border bg-card px-3 py-2 text-sm" />
                          <p className="text-xs text-muted-foreground">Obrigatório para torneios. Em cash game, deixe vazio.</p>
                        </div>

                        <div className="grid gap-2">
                          <label htmlFor={`blinds-${item.id}`} className="text-sm font-medium">
                            Blinds (cash game)
                          </label>
                          <input id={`blinds-${item.id}`} name="blinds" defaultValue={item.blinds ?? ""} className="rounded-xl border bg-card px-3 py-2 text-sm" />
                          <p className="text-xs text-muted-foreground">Obrigatório para cash game. Em torneios, deixe vazio.</p>
                        </div>

                        <div className="grid gap-2">
                          <label htmlFor={`maxPlayers-${item.id}`} className="text-sm font-medium">
                            Máximo de jogadores
                          </label>
                          <input id={`maxPlayers-${item.id}`} name="maxPlayers" type="number" min="1" defaultValue={item.max_players} className="rounded-xl border bg-card px-3 py-2 text-sm" />
                          <p className="text-xs text-muted-foreground">Use um número inteiro maior que zero.</p>
                        </div>

                        <div className="grid gap-2">
                          <label htmlFor={`status-${item.id}`} className="text-sm font-medium">
                            Status
                          </label>
                          <select id={`status-${item.id}`} name="status" defaultValue={item.status} className="rounded-xl border bg-card px-3 py-2 text-sm">
                            <option value="upcoming">Upcoming</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="finished">Finished</option>
                          </select>
                        </div>

                        <div className="grid gap-2">
                          <label htmlFor={`eventDate-${item.id}`} className="text-sm font-medium">
                            Data do evento
                          </label>
                          <input id={`eventDate-${item.id}`} name="eventDate" type="datetime-local" defaultValue={formatDateTimeLocal(item.event_date)} className="rounded-xl border bg-card px-3 py-2 text-sm" />
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button type="submit">Salvar alterações</Button>
                          <Button asChild variant="outline">
                            <Link href="/eventos">Abrir página pública</Link>
                          </Button>
                        </div>
                      </form>
                    </details>

                    <form action={deleteEventAction} className="mt-4">
                      <input type="hidden" name="id" value={item.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        Excluir evento
                      </Button>
                    </form>
                  </article>
                )
              })
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                Nenhum evento cadastrado ainda.
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
