import { ArrowLeftIcon, CalendarDaysIcon, Clock3Icon, TagIcon } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { getNewsBySlug, getPublishedNewsSlugs } from "@/services/news.service"

export const revalidate = 3600

const categoryLabelMap: Record<string, string> = {
  clube: "Clube",
  eventos: "Eventos",
  ranking: "Ranking",
  assinatura: "Assinatura",
  comunicado: "Comunicado",
  promocao: "Promocao",
}

type SlugParams = {
  slug: string
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value))
}

function splitContentIntoParagraphs(content: string) {
  return content
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export async function generateStaticParams() {
  const slugs = await getPublishedNewsSlugs()

  return slugs.map((slug) => ({ slug }))
}

export default async function NewsDetailsPage({
  params,
}: {
  params: SlugParams | Promise<SlugParams>
}) {
  const resolvedParams = await Promise.resolve(params)
  const article = await getNewsBySlug(resolvedParams.slug)

  if (!article) {
    notFound()
  }

  const contentParagraphs = splitContentIntoParagraphs(article.content)

  return (
    <section className="relative isolate overflow-hidden px-4 pb-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 -top-30 h-70 w-70 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl sm:h-90 sm:w-90" />
        <div className="absolute -left-20 top-80 h-55 w-55 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <article className="mx-auto w-full max-w-4xl rounded-3xl border border-border/80 bg-card/70 p-5 backdrop-blur sm:p-8">
        <Link
          href="/noticias"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Voltar para noticias
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-primary">
            <TagIcon className="size-3.5" aria-hidden="true" />
            {categoryLabelMap[article.category] ?? "Noticias"}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDaysIcon className="size-3.5" aria-hidden="true" />
            {formatDate(article.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3Icon className="size-3.5" aria-hidden="true" />
            {article.readTimeMinutes} min de leitura
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-balance sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">{article.summary}</p>

        {contentParagraphs.length > 0 ? (
          <div className="prose prose-invert mt-8 max-w-none text-foreground/95">
            {contentParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  )
}
