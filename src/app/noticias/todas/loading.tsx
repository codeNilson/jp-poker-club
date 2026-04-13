import { Skeleton } from "@/components/ui/skeleton"

function NewsCardSkeleton({ hasImage }: { hasImage?: boolean }) {
  return (
    <article className="mb-4 break-inside-avoid rounded-3xl border border-border/80 bg-card/60 p-5">
      {/* meta: categoria + data + tempo */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-4 w-14 rounded-full" />
      </div>

      {hasImage ? (
        <div className="mt-3 md:flex md:items-start md:gap-4">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-5 w-full rounded-xl" />
            <Skeleton className="mt-1.5 h-5 w-4/5 rounded-xl" />
            <Skeleton className="mt-3 h-4 w-full rounded-full" />
            <Skeleton className="mt-2 h-4 w-11/12 rounded-full" />
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-border/70 bg-muted/40 md:mt-0 md:w-28 md:shrink-0">
            <div className="relative aspect-video w-full">
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        </div>
      ) : (
        <>
          <Skeleton className="mt-3 h-5 w-full rounded-xl" />
          <Skeleton className="mt-1.5 h-5 w-3/4 rounded-xl" />
          <Skeleton className="mt-3 h-4 w-full rounded-full" />
          <Skeleton className="mt-2 h-4 w-5/6 rounded-full" />
        </>
      )}

      {/* "Continuar lendo" */}
      <Skeleton className="mt-4 h-4 w-32 rounded-full" />
    </article>
  )
}

export default function AllNewsLoading() {
  return (
    <section className="isolate overflow-hidden px-4 pb-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 -top-30 h-70 w-70 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl sm:h-90 sm:w-90" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="columns-1 gap-4 md:columns-2" aria-busy="true" aria-label="Carregando notícias">
          <NewsCardSkeleton />
          <NewsCardSkeleton hasImage />
          <NewsCardSkeleton />
          <NewsCardSkeleton hasImage />
          <NewsCardSkeleton />
          <NewsCardSkeleton />
        </section>

        {/* paginação skeleton */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-9 rounded-full" />
          <Skeleton className="h-8 w-9 rounded-full" />
          <Skeleton className="h-8 w-9 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>

        {/* "Mostrando página X de Y" */}
        <Skeleton className="mx-auto h-3 w-40 rounded-full" />
      </div>
    </section>
  )
}
