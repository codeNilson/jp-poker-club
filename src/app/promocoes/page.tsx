import Link from "next/link"
import { ConstructionIcon, SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function PromocoesPage() {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-16 sm:px-6 lg:px-8 animate-in fade-in-0 duration-500">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 -top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -right-24 top-1/2 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-4xl">
        <article className="rounded-3xl border border-border/80 bg-card/70 p-5 text-center backdrop-blur sm:p-8">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            <ConstructionIcon className="size-3.5" aria-hidden="true" />
            Work in progress
          </span>

          <h1 className="mt-5 text-2xl font-black tracking-tight sm:text-4xl">Página de promoções em construção</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Em breve você verá campanhas ativas, benefícios para assinantes e regras de participação de forma clara.
          </p>

          <div className="mt-6 rounded-2xl border border-border/70 bg-muted/30 p-4 text-left sm:p-5">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <SparklesIcon className="size-4" aria-hidden="true" />
              Em breve nesta seção
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Promoções por período, destaque para novidades e condições atualizadas direto do painel administrativo.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full px-5">
              <Link href="/">Voltar para início</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href="/noticias">Ver notícias</Link>
            </Button>
          </div>
        </article>
      </div>
    </section>
  )
}
