import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAdminAccess } from "@/lib/admin/access"
import { getAdminWallets, getAdminWalletTransactions } from "@/lib/admin/wallet"

import { adjustWalletBalanceAction } from "./actions"

type SearchParams = {
  success?: string | string[]
  error?: string | string[]
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatUserLabel(userId: string, displayName: string | null) {
  void userId

  if (displayName) {
    return displayName
  }

  return "Usuário sem nome"
}

export default async function AdminWalletPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {})
  const notice = parseNotice(resolvedSearchParams)
  const wallets = await getAdminWallets()
  const walletTransactions = await getAdminWalletTransactions(40)
  const { role } = await getAdminAccess()
  const canAdjust = role === "admin"

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="rounded-3xl border bg-card p-4 shadow-sm sm:p-6">
        <p className="text-sm font-medium text-primary">Admin / Carteiras</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">Gerenciar carteiras</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ajustes de saldo são permitidos apenas para admin e ficam auditados em wallet_transactions.
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

      <div className="mt-6 grid items-start gap-6 xl:mt-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:gap-8">
        <section className="rounded-3xl border bg-card p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold">Ajuste manual de saldo</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use valor positivo para credito e valor negativo para debito.
          </p>

          <form action={adjustWalletBalanceAction} className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="adjust-userId" className="text-sm font-medium">
                Usuário
              </label>
              <select id="adjust-userId" name="userId" disabled={!canAdjust} className="rounded-xl border bg-background px-3 py-2 text-sm disabled:opacity-60">
                {wallets.map((wallet) => (
                  <option key={wallet.user_id} value={wallet.user_id}>
                    {formatUserLabel(wallet.user_id, wallet.user_display_name)} ({formatCurrency(wallet.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="adjust-amount" className="text-sm font-medium">
                Valor do ajuste
              </label>
              <Input
                id="adjust-amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="Ex: 50 ou -20"
                disabled={!canAdjust}
                className="rounded-xl bg-background disabled:opacity-60"
              />
              <p className="text-xs text-muted-foreground">Use valor positivo para crédito e negativo para débito.</p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="adjust-reason" className="text-sm font-medium">
                Motivo
              </label>
              <textarea id="adjust-reason" name="reason" rows={3} disabled={!canAdjust} className="rounded-xl border bg-background px-3 py-2 text-sm disabled:opacity-60" />
              <p className="text-xs text-muted-foreground">Opcional, mas recomendado para auditoria.</p>
            </div>

            <Button type="submit" disabled={!canAdjust || wallets.length === 0}>
              {canAdjust ? "Aplicar ajuste" : "Somente admin pode ajustar"}
            </Button>
          </form>
        </section>

        <section className="rounded-3xl border bg-card p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold">Últimas transações</h2>
          <div className="mt-4 space-y-3">
            {walletTransactions.length > 0 ? (
              walletTransactions.map((tx) => (
                <article key={tx.id} className="rounded-2xl border p-3 text-sm">
                  <p className="font-medium wrap-break-word">{tx.user_display_name ?? "Usuário sem nome"}</p>
                  <p className="text-muted-foreground">
                    {tx.type} | {formatCurrency(tx.amount)} | {formatDate(tx.created_at)}
                  </p>
                  <p className="text-muted-foreground">
                    {formatCurrency(tx.balance_before)} -&gt; {formatCurrency(tx.balance_after)}
                  </p>
                  {tx.reference_type === "admin_adjustment" && tx.actor_display_name ? (
                    <p className="text-xs text-muted-foreground">Atualizado por: {tx.actor_display_name}</p>
                  ) : null}
                  {tx.description ? <p className="text-muted-foreground">{tx.description}</p> : null}
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">Sem transacoes recentes.</div>
            )}
          </div>

          <h3 className="mt-6 text-base font-semibold">Carteiras</h3>
          <div className="mt-3 space-y-3">
            {wallets.length > 0 ? (
              wallets.map((wallet) => (
                <article key={wallet.user_id} className="rounded-2xl border p-3 text-sm">
                  <p className="font-medium wrap-break-word">{wallet.user_display_name ?? "Usuário sem nome"}</p>
                  <p className="text-muted-foreground">Saldo: {formatCurrency(wallet.balance)}</p>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">Nenhuma carteira encontrada.</div>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
