import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CircleDotIcon,
  Clock3Icon,
  FlameIcon,
  SparklesIcon,
  TagIcon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  getFeaturedNews,
  getNewsFeed,
  NEWS_CATEGORY_LABELS,
} from "@/services/news.service"
import { getRadarWeekItems } from "@/services/radar.service"

export const revalidate = 3600

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function formatRadarDate(value: string) {
  const date = new Date(value)

  const dayPart = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date)

  const timePart = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)

  return `${dayPart}, ${timePart}`
}

export default async function NewsPage() {

  const [featured, feed, radarItems] = await Promise.all([
    getFeaturedNews(),
    getNewsFeed(7),
    getRadarWeekItems(3),
  ])

  const fallbackFeatured = feed[0] ?? null
  const featuredNews = featured ?? fallbackFeatured
  const newsFeed = feed.filter((item) => item.id !== featuredNews?.id)

  return (
    <section className="isolate overflow-hidden px-4 pb-16 sm:px-6 lg:px-8 animate-in fade-in-0 duration-500">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 -top-30 h-70 w-70 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl sm:h-90 sm:w-90" />
        <div className="absolute -right-20 top-70 h-55 w-55 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <article className="relative overflow-hidden rounded-3xl border border-border/80 bg-linear-to-br from-primary/12 via-card to-card p-6 sm:p-8">
            {featuredNews ? (
              <>
                {featuredNews.coverImageUrl ? (
                  <div className="mb-5 overflow-hidden rounded-2xl border border-border/60 bg-muted/30">
                    <div className="relative aspect-video w-full">
                      <Image
                        src={featuredNews.coverImageUrl}
                        alt={`Capa da notícia ${featuredNews.title}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 65vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                ) : null}

                <div className="mb-4 flex items-center gap-3 text-xs font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-primary">
                    <TagIcon className="size-3.5" aria-hidden="true" />
                    {NEWS_CATEGORY_LABELS[featuredNews.category]}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDaysIcon className="size-3.5" aria-hidden="true" />
                    {formatDate(featuredNews.publishedAt)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3Icon className="size-3.5" aria-hidden="true" />
                    {featuredNews.readTimeMinutes} min
                  </span>
                </div>

                <h2 className="max-w-xl text-2xl font-extrabold leading-tight text-balance sm:text-3xl">
                  <Link
                    href={`/noticias/${featuredNews.slug}`}
                    className="transition-colors hover:text-primary"
                  >
                    {featuredNews.title}
                  </Link>
                </h2>
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                  {featuredNews.summary}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button asChild className="h-10 rounded-full px-5 text-sm font-semibold">
                    <Link href={`/noticias/${featuredNews.slug}`}>
                      Ler matéria completa
                      <ArrowRightIcon className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  {featuredNews.isHot ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-orange-400/60 bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-300">
                      <FlameIcon className="size-3.5" aria-hidden="true" />
                      Em alta
                    </span>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">
                <h2 className="text-xl font-bold">Sem notícia destaque no momento</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Assim que o admin publicar uma matéria com destaque, ela aparecerá aqui automaticamente.
                </p>
              </div>
            )}
          </article>

          <aside className="self-start rounded-3xl border border-border/80 bg-card/70 p-5 sm:p-6">
            <h3 className="text-lg font-bold">Radar da semana</h3>
            <ul className="mt-4 space-y-3">
              {radarItems.length > 0 ? (
                radarItems.map((item) => (
                  <li key={item.id} className="rounded-2xl border border-border/70 bg-muted/40 p-3">
                    <p className="text-xs font-semibold text-primary">{formatRadarDate(item.date)}</p>
                    <p className="mt-1 text-sm font-medium">{item.title}</p>
                  </li>
                ))
              ) : (
                <li className="rounded-2xl border border-border/70 bg-muted/40 p-3">
                  <p className="text-xs font-semibold text-primary">SEM DADOS</p>
                  <p className="mt-1 text-sm font-medium">Publique notícias e eventos para alimentar o radar.</p>
                </li>
              )}
            </ul>

            <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/10 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                <SparklesIcon className="size-4" aria-hidden="true" />
                Receba novidades por email
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Resumo semanal com notícias, eventos e comunicados do clube.
              </p>
            </div>
          </aside>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/noticias/todas">
              Ver todas
            </Link>
          </Button>
        </div>

        {newsFeed.length > 0 ? (
          <section className="columns-1 gap-4 md:columns-2">
            {newsFeed.map((item) => (
              <article
                key={item.id}
                className="group mb-4 break-inside-avoid rounded-3xl border border-border/80 bg-card/60 p-5 transition-colors hover:bg-card"
              >
                <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-primary">
                    <CircleDotIcon className="size-3.5" aria-hidden="true" />
                    {NEWS_CATEGORY_LABELS[item.category]}
                  </span>
                  <span>{formatDate(item.publishedAt)}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3Icon className="size-3.5" aria-hidden="true" />
                    {item.readTimeMinutes} min
                  </span>
                </div>

                {item.coverImageUrl ? (
                  <div className="mt-3 md:flex md:items-start md:gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold leading-snug transition-colors group-hover:text-primary">
                        <Link href={`/noticias/${item.slug}`} className="hover:text-primary">
                          {item.title}
                        </Link>
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-xl border border-border/70 bg-muted/40 md:mt-0 md:w-28 md:shrink-0">
                      <div className="relative aspect-video w-full">
                        <Image
                          src={item.coverImageUrl}
                          alt={`Miniatura da notícia ${item.title}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 112px"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="mt-3 text-lg font-bold leading-snug transition-colors group-hover:text-primary">
                      <Link href={`/noticias/${item.slug}`} className="hover:text-primary">
                        {item.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
                  </>
                )}

                <Link
                  href={`/noticias/${item.slug}`}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  Continuar lendo
                  <ArrowRightIcon className="size-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </section>
        ) : null}

      </div>
    </section>
  )
}