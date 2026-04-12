import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  Clock3Icon,
  TagIcon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import {
  getNewsBySlug,
  getNewsFeed,
  getPublishedNewsSlugs,
  NEWS_CATEGORY_LABELS,
} from "@/services/news.service"

export const revalidate = 3600

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

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
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
  const relatedNews = (await getNewsFeed(5)).filter((item) => item.id !== article.id).slice(0, 3)

  return (
    <section className="isolate overflow-hidden px-4 pb-16 sm:px-6 lg:px-8 animate-in fade-in-0 duration-500">
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
          Voltar para notícias
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-primary">
            <TagIcon className="size-3.5" aria-hidden="true" />
            {NEWS_CATEGORY_LABELS[article.category]}
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

        {article.coverImageUrl ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border/70 bg-muted/40">
            <div className="relative aspect-video w-full">
              <Image
                src={article.coverImageUrl}
                alt={`Capa da notícia ${article.title}`}
                fill
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-cover"
              />
            </div>
          </div>
        ) : null}

        {contentParagraphs.length > 0 ? (
          <div className="prose prose-invert mt-8 max-w-none text-foreground/95">
            {contentParagraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 32)}`}>{paragraph}</p>
            ))}
          </div>
        ) : null}

        {relatedNews.length > 0 ? (
          <section className="mt-10 border-t border-border/70 pt-7">
            <h2 className="text-xl font-extrabold tracking-tight">Veja mais</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {relatedNews.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-border/70 bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                >
                  <p className="text-xs font-medium text-muted-foreground">{formatShortDate(item.publishedAt)}</p>
                  <h3 className="mt-2 text-sm font-bold leading-snug sm:text-base">
                    <Link href={`/noticias/${item.slug}`} className="transition-colors hover:text-primary">
                      {item.title}
                    </Link>
                  </h3>
                  <Link
                    href={`/noticias/${item.slug}`}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary sm:text-sm"
                  >
                    Veja mais
                    <ArrowRightIcon className="size-3.5" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </section>
  )
}
