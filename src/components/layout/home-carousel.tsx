"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type HomeCarouselItem = {
  id: string
  title: string
  description: string | null
  desktopImageUrl: string
  mobileImageUrl: string
  actionText: string
  linkUrl: string
}

type HomeCarouselProps = {
  items: HomeCarouselItem[]
}

const AUTO_PLAY_DELAY_MS = 5000

export function HomeCarousel({ items }: HomeCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const hasMultipleItems = items.length > 1

  const safeItems = useMemo(() => items.filter((item) => item.linkUrl), [items])

  useEffect(() => {
    if (!hasMultipleItems) {
      return
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % safeItems.length)
    }, AUTO_PLAY_DELAY_MS)

    return () => window.clearInterval(timer)
  }, [hasMultipleItems, safeItems.length])

  if (safeItems.length === 0) {
    return null
  }

  const currentIndex = activeIndex % safeItems.length

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + safeItems.length) % safeItems.length)
  }

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % safeItems.length)
  }

  return (
    <section aria-label="Destaques" className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:max-w-4xl">
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {safeItems.map((item) => (
            <article key={item.id} className="relative w-full shrink-0 overflow-hidden">
              <div className="relative aspect-[2.8/1] min-h-32 sm:aspect-3/1 lg:aspect-[3.4/1]">
                <picture>
                  <source media="(min-width: 768px)" srcSet={item.desktopImageUrl} />
                  <img
                    src={item.mobileImageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </picture>
                <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/75 via-black/45 to-black/10" />

                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-md px-4 py-3 sm:px-7 sm:py-5">
                    <p className="mb-1 text-[10px] font-semibold tracking-[0.2em] text-primary sm:text-xs">
                      JP POKER CLUB
                    </p>
                    <h2 className="line-clamp-2 text-base font-semibold text-white sm:text-2xl">
                      {item.title}
                    </h2>
                    {item.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-white/85 sm:mt-2 sm:text-sm">
                        {item.description}
                      </p>
                    ) : null}
                    <Button
                      asChild
                      size="sm"
                      className="mt-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Link href={item.linkUrl}>{item.actionText}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {hasMultipleItems ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={goToPrevious}
              aria-label="Slide anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 text-white hover:bg-black/65"
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={goToNext}
              aria-label="Próximo slide"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 text-white hover:bg-black/65"
            >
              <ChevronRight />
            </Button>

            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
              {safeItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Ir para slide ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    index === currentIndex
                      ? "w-5 bg-primary"
                      : "w-2 bg-white/60 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}
