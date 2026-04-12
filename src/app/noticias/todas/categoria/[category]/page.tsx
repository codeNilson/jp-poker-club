import {
  ArrowRightIcon,
  CircleDotIcon,
  Clock3Icon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { NEWS_PAGE_SIZE } from "@/constants/news"
import { Button } from "@/components/ui/button"
import {
  getPaginatedNewsFeed,
  isNewsCategory,
  NEWS_CATEGORY_LABELS,
  NEWS_CATEGORY_OPTIONS,
} from "@/services/news.service"

export const revalidate = 3600

type CategoryParams = {
  category: string
}

type NewsPageSearchParams = {
  page?: string | string[]
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function parsePageParam(searchParams: NewsPageSearchParams): number {
  const pageParam = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page
  const parsedPage = Number(pageParam)

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    return 1
  }

  return parsedPage
}

function createPageHref(page: number, category: string): string {
  const query = new URLSearchParams()

  if (page > 1) {
    query.set("page", String(page))
  }

  const basePath = `/noticias/todas/categoria/${category}`
  const queryString = query.toString()
  return queryString ? `${basePath}?${queryString}` : basePath
}

function createCategoryHref(category: string | null): string {
  if (!category) {
    return "/noticias/todas"
  }

  return `/noticias/todas/categoria/${category}`
}

export function generateStaticParams() {
  return NEWS_CATEGORY_OPTIONS.map((category) => ({ category }))
}

export default async function CategoryNewsListPage({
  params,
  searchParams,
}: {
  params: CategoryParams | Promise<CategoryParams>
  searchParams: NewsPageSearchParams | Promise<NewsPageSearchParams>
}) {
  const resolvedParams = await Promise.resolve(params)

  if (!isNewsCategory(resolvedParams.category)) {
    notFound()
  }

  const resolvedSearchParams = await Promise.resolve(searchParams)
  const requestedPage = parsePageParam(resolvedSearchParams)
  const selectedCategory = resolvedParams.category

  const paginatedFeed = await getPaginatedNewsFeed({
    page: requestedPage,
    pageSize: NEWS_PAGE_SIZE,
    category: selectedCategory,
  })

  if (paginatedFeed.totalPages > 0 && requestedPage > paginatedFeed.totalPages) {
    redirect(createPageHref(paginatedFeed.totalPages, selectedCategory))
  }

  const isFirstPage = paginatedFeed.page <= 1
  const isLastPage = paginatedFeed.totalPages === 0 || paginatedFeed.page >= paginatedFeed.totalPages
  const newsFeed = paginatedFeed.items

  const categories = [
    { label: "Todas", value: null },
    ...NEWS_CATEGORY_OPTIONS.map((category) => ({
      label: NEWS_CATEGORY_LABELS[category],
      value: category,
    })),
  ]

  return (
    <section className="isolate overflow-hidden px-4 pb-16 sm:px-6 lg:px-8 animate-in fade-in-0 duration-500">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 -top-30 h-70 w-70 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl sm:h-90 sm:w-90" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = category.value === selectedCategory

            return (
              <Button
                key={category.label}
                asChild
                variant={isActive ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                <Link href={createCategoryHref(category.value)} aria-current={isActive ? "page" : undefined}>
                  {category.label}
                </Link>
              </Button>
            )
          })}
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

        {paginatedFeed.totalPages > 1 ? (
          <nav className="mt-2 flex flex-wrap items-center justify-center gap-2" aria-label="Paginação de todas as notícias">
            {isFirstPage ? (
              <Button variant="outline" size="sm" className="rounded-full" disabled>
                Anterior
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href={createPageHref(paginatedFeed.page - 1, selectedCategory)}>Anterior</Link>
              </Button>
            )}

            {Array.from({ length: paginatedFeed.totalPages }, (_, index) => index + 1).map((pageNumber) => {
              const isActive = pageNumber === paginatedFeed.page

              return (
                <Button
                  key={pageNumber}
                  asChild
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  className="min-w-9 rounded-full"
                >
                  <Link href={createPageHref(pageNumber, selectedCategory)} aria-current={isActive ? "page" : undefined}>
                    {pageNumber}
                  </Link>
                </Button>
              )
            })}

            {isLastPage ? (
              <Button variant="outline" size="sm" className="rounded-full" disabled>
                Próxima
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href={createPageHref(paginatedFeed.page + 1, selectedCategory)}>Próxima</Link>
              </Button>
            )}
          </nav>
        ) : null}

        <p className="text-center text-xs text-muted-foreground">
          Mostrando página {paginatedFeed.page} de {Math.max(paginatedFeed.totalPages, 1)}.
        </p>
      </div>
    </section>
  )
}
