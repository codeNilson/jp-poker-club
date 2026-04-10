import { Skeleton } from "@/components/ui/skeleton"

function NewsCardSkeleton() {
  return (
    <article className="mb-4 break-inside-avoid rounded-3xl border border-border/80 bg-card/60 p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-4 w-24 rounded-full" />
      </div>

      <Skeleton className="mt-4 h-5 w-3/4 rounded-full" />
      <Skeleton className="mt-3 h-4 w-full rounded-full" />
      <Skeleton className="mt-2 h-4 w-11/12 rounded-full" />

      <Skeleton className="mt-4 h-4 w-28 rounded-full" />
    </article>
  )
}

export default function NewsLoading() {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 -top-30 h-70 w-70 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl sm:h-90 sm:w-90" />
        <div className="absolute -right-20 top-70 h-55 w-55 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-border/80 bg-card/70 p-5 backdrop-blur sm:p-7">
          <Skeleton className="mb-4 h-7 w-44 rounded-full" />
          <Skeleton className="h-10 w-full max-w-3xl rounded-2xl" />
          <Skeleton className="mt-3 h-5 w-full max-w-2xl rounded-full" />
          <Skeleton className="mt-2 h-5 w-4/5 max-w-xl rounded-full" />
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <article className="rounded-3xl border border-border/80 bg-linear-to-br from-primary/12 via-card to-card p-6 sm:p-8">
            <Skeleton className="mb-5 aspect-video w-full rounded-2xl" />
            <Skeleton className="h-4 w-56 rounded-full" />
            <Skeleton className="mt-4 h-8 w-full max-w-2xl rounded-2xl" />
            <Skeleton className="mt-3 h-5 w-full rounded-full" />
            <Skeleton className="mt-2 h-5 w-5/6 rounded-full" />
            <div className="mt-6 flex flex-wrap gap-3">
              <Skeleton className="h-10 w-44 rounded-full" />
              <Skeleton className="h-10 w-24 rounded-full" />
            </div>
          </article>

          <aside className="rounded-3xl border border-border/80 bg-card/70 p-5 sm:p-6">
            <Skeleton className="h-6 w-36 rounded-full" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
            <Skeleton className="mt-5 h-24 w-full rounded-2xl" />
          </aside>
        </div>

        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>

        <section className="columns-1 gap-4 md:columns-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <NewsCardSkeleton key={index} />
          ))}
        </section>

        <div className="flex justify-center">
          <Skeleton className="h-10 w-72 rounded-full" />
        </div>
      </div>
    </section>
  )
}