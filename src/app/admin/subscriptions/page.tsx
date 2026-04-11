import Link from "next/link"

import { Button } from "@/components/ui/button"
import { getAdminAccess } from "@/lib/admin/access"
import { getAdminSubscriptions } from "@/lib/admin/subscriptions"

import { updateSubscriptionAction } from "./actions"

type SearchParams = {
  success?: string | string[]
  error?: string | string[]
  status?: string | string[]
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

function formatDateTimeLocal(value: string | null) {
  if (!value) {
    return ""
  }

  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function formatDisplayDate(value: string | null) {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {})
  const notice = parseNotice(resolvedSearchParams)
  const subscriptions = await getAdminSubscriptions()
  const { role } = await getAdminAccess()
  const canEdit = role === "admin"
  const statusFilterParam = Array.isArray(resolvedSearchParams.status)
    ? resolvedSearchParams.status[0]
    : resolvedSearchParams.status
  const statusFilter =
    statusFilterParam === "active" ||
    statusFilterParam === "inactive" ||
    statusFilterParam === "past_due" ||
    statusFilterParam === "canceled"
      ? statusFilterParam
      : "all"

  const filteredSubscriptions =
    statusFilter === "all"
      ? subscriptions
      : subscriptions.filter((item) => item.status === statusFilter)

  const statusOptions = [
    { label: "Todas", value: "all" },
    { label: "Ativas", value: "active" },
    { label: "Inativas", value: "inactive" },
    { label: "Atrasadas", value: "past_due" },
    { label: "Canceladas", value: "canceled" },
  ] as const

  function getStatusHref(value: string) {
    if (value === "all") {
      return "/admin/subscriptions"
    }

    return `/admin/subscriptions?status=${value}`
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-3xl border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-primary">Admin / Subscriptions</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Gerenciar assinaturas</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Operador possui leitura. Alteracoes de status e periodo ficam restritas a admin.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">Voltar ao painel</Link>
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

      <section className="mt-8 rounded-3xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Assinaturas cadastradas</h2>
          <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">{filteredSubscriptions.length} itens</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Button key={option.value} asChild variant={statusFilter === option.value ? "default" : "outline"} size="sm">
              <Link href={getStatusHref(option.value)}>{option.label}</Link>
            </Button>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          {filteredSubscriptions.length > 0 ? (
            filteredSubscriptions.map((item) => (
              <article key={item.user_id} className="rounded-3xl border p-5">
                <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                  <span>User: {item.user_id}</span>
                  <span>Status: {item.status}</span>
                  <span>Inicio: {formatDisplayDate(item.current_period_start)}</span>
                  <span>Fim: {formatDisplayDate(item.current_period_end)}</span>
                  <span>Cancelada em: {formatDisplayDate(item.canceled_at)}</span>
                </div>

                <details className="mt-5 rounded-2xl border bg-background p-4" open={canEdit}>
                  <summary className="cursor-pointer text-sm font-medium">
                    {canEdit ? "Editar assinatura" : "Visualizacao de assinatura"}
                  </summary>

                  <form action={updateSubscriptionAction} className="mt-4 grid gap-4">
                    <input type="hidden" name="userId" value={item.user_id} />

                    <div className="grid gap-2">
                      <label htmlFor={`status-${item.user_id}`} className="text-sm font-medium">
                        Status
                      </label>
                      <select
                        id={`status-${item.user_id}`}
                        name="status"
                        defaultValue={item.status}
                        disabled={!canEdit}
                        className="rounded-xl border bg-card px-3 py-2 text-sm disabled:opacity-60"
                      >
                        <option value="inactive">Inactive</option>
                        <option value="active">Active</option>
                        <option value="past_due">Past due</option>
                        <option value="canceled">Canceled</option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor={`currentPeriodStart-${item.user_id}`} className="text-sm font-medium">
                        Inicio do periodo
                      </label>
                      <input
                        id={`currentPeriodStart-${item.user_id}`}
                        name="currentPeriodStart"
                        type="datetime-local"
                        defaultValue={formatDateTimeLocal(item.current_period_start)}
                        disabled={!canEdit}
                        className="rounded-xl border bg-card px-3 py-2 text-sm disabled:opacity-60"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor={`currentPeriodEnd-${item.user_id}`} className="text-sm font-medium">
                        Fim do periodo
                      </label>
                      <input
                        id={`currentPeriodEnd-${item.user_id}`}
                        name="currentPeriodEnd"
                        type="datetime-local"
                        defaultValue={formatDateTimeLocal(item.current_period_end)}
                        disabled={!canEdit}
                        className="rounded-xl border bg-card px-3 py-2 text-sm disabled:opacity-60"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor={`canceledAt-${item.user_id}`} className="text-sm font-medium">
                        Cancelada em
                      </label>
                      <input
                        id={`canceledAt-${item.user_id}`}
                        name="canceledAt"
                        type="datetime-local"
                        defaultValue={formatDateTimeLocal(item.canceled_at)}
                        disabled={!canEdit}
                        className="rounded-xl border bg-card px-3 py-2 text-sm disabled:opacity-60"
                      />
                    </div>

                    <Button type="submit" disabled={!canEdit}>
                      {canEdit ? "Salvar assinatura" : "Somente leitura para operator"}
                    </Button>
                  </form>
                </details>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
              Nenhuma assinatura encontrada para o filtro atual.
            </div>
          )}
        </div>
      </section>
    </section>
  )
}
