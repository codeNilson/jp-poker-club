import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CircleDotIcon,
  Clock3Icon,
  FlameIcon,
  NewspaperIcon,
  SparklesIcon,
  TagIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"

type NewsItem = {
  id: string
  title: string
  summary: string
  category: string
  readTime: string
  date: string
  hot?: boolean
}

const featuredNews: NewsItem = {
  id: "featured",
  title: "Ranking de abril vai premiar os 8 melhores com stack inicial turbo",
  summary:
    "A nova etapa do ranking chega com premiação estendida, pontos dobrados no evento principal e bônus extra para quem estiver com assinatura ativa.",
  category: "Clube",
  readTime: "4 min",
  date: "04 abr 2026",
  hot: true,
}

const newsFeed: NewsItem[] = [
  {
    id: "n1",
    title: "Agenda oficial de torneios de abril foi atualizada",
    summary:
      "Confira as datas, horários e limites de jogadores dos próximos eventos presenciais do clube.",
    category: "Eventos",
    readTime: "3 min",
    date: "03 abr 2026",
  },
  {
    id: "n2",
    title: "Como funciona o bônus de 20% para assinantes na carteira",
    summary:
      "Entenda, de forma simples, quando o crédito extra é aplicado e como visualizar no histórico.",
    category: "Assinatura",
    readTime: "5 min",
    date: "02 abr 2026",
  },
  {
    id: "n3",
    title: "Elo do clube: ajustes de visual no perfil e nova página de histórico",
    summary:
      "As molduras de tier ficaram mais claras e o histórico de resultados agora mostra ganho de pontos por evento.",
    category: "Ranking",
    readTime: "4 min",
    date: "01 abr 2026",
  },
  {
    id: "n4",
    title: "Regras de buy-in presencial: proposta em análise pela equipe",
    summary:
      "Estamos validando o fluxo ideal entre débito de carteira e registro de pagamento externo com o admin.",
    category: "Comunicado",
    readTime: "2 min",
    date: "30 mar 2026",
  },
]

const categories = ["Todas", "Eventos", "Ranking", "Assinatura", "Comunicado"]

export default function NewsPage() {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 -top-30 h-70 w-70 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl sm:h-90 sm:w-90" />
        <div className="absolute -right-20 top-70 h-55 w-55 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-border/80 bg-card/70 p-5 backdrop-blur sm:p-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            <NewspaperIcon className="size-3.5" aria-hidden="true" />
            Central de noticias
          </div>
          <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-balance sm:text-4xl">
            Tudo que move o clube, em um feed rapido e direto.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Avisos importantes, novidades do ranking, agenda de eventos e atualizacoes da comunidade JP Poker Club.
          </p>
        </header>

        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <button
              key={category}
              type="button"
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                index === 0
                  ? "border-primary/60 bg-primary text-primary-foreground"
                  : "border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <article className="relative overflow-hidden rounded-3xl border border-border/80 bg-linear-to-br from-primary/12 via-card to-card p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-3 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-primary">
                <TagIcon className="size-3.5" aria-hidden="true" />
                {featuredNews.category}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDaysIcon className="size-3.5" aria-hidden="true" />
                {featuredNews.date}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3Icon className="size-3.5" aria-hidden="true" />
                {featuredNews.readTime}
              </span>
            </div>

            <h2 className="max-w-xl text-2xl font-extrabold leading-tight text-balance sm:text-3xl">
              {featuredNews.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {featuredNews.summary}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button className="h-10 rounded-full px-5 text-sm font-semibold">
                Ler materia completa
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Button>
              {featuredNews.hot ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-orange-400/60 bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-300">
                  <FlameIcon className="size-3.5" aria-hidden="true" />
                  Em alta no clube
                </span>
              ) : null}
            </div>
          </article>

          <aside className="rounded-3xl border border-border/80 bg-card/70 p-5 sm:p-6">
            <h3 className="text-lg font-bold">Radar da semana</h3>
            <ul className="mt-4 space-y-3">
              <li className="rounded-2xl border border-border/70 bg-muted/40 p-3">
                <p className="text-xs font-semibold text-primary">SAB 20:00</p>
                <p className="mt-1 text-sm font-medium">Turbo Knockout presencial</p>
              </li>
              <li className="rounded-2xl border border-border/70 bg-muted/40 p-3">
                <p className="text-xs font-semibold text-primary">DOM 18:30</p>
                <p className="mt-1 text-sm font-medium">Atualizacao oficial do ranking</p>
              </li>
              <li className="rounded-2xl border border-border/70 bg-muted/40 p-3">
                <p className="text-xs font-semibold text-primary">SEG 12:00</p>
                <p className="mt-1 text-sm font-medium">Nova promocao de deposito</p>
              </li>
            </ul>

            <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/10 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                <SparklesIcon className="size-4" aria-hidden="true" />
                Receba novidades por email
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Resumo semanal com noticias, eventos e comunicados do clube.
              </p>
            </div>
          </aside>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          {newsFeed.map((item) => (
            <article
              key={item.id}
              className="group rounded-3xl border border-border/80 bg-card/60 p-5 transition-colors hover:bg-card"
            >
              <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 text-primary">
                  <CircleDotIcon className="size-3.5" aria-hidden="true" />
                  {item.category}
                </span>
                <span>{item.date}</span>
                <span>{item.readTime}</span>
              </div>

              <h3 className="text-lg font-bold leading-snug transition-colors group-hover:text-primary">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>

              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                Continuar lendo
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </button>
            </article>
          ))}
        </section>
      </div>
    </section>
  )
}