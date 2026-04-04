"use client"

import { usePathname } from "next/navigation"

export function GlobalBackground() {
  const pathname = usePathname()

  const isHome = pathname === "/"
  const isPrimaryLanding = pathname === "/noticias" || pathname === "/eventos" || pathname === "/promocoes"

  const primaryGlow = isHome ? "bg-primary/18 blur-3xl" : isPrimaryLanding ? "bg-primary/12 blur-3xl" : "bg-primary/8 blur-3xl"
  const secondaryGlow = isHome ? "bg-emerald-500/12 blur-3xl" : isPrimaryLanding ? "bg-emerald-500/8 blur-3xl" : "bg-emerald-500/5 blur-3xl"
  const tertiaryGlow = isHome ? "bg-primary/10 blur-3xl" : isPrimaryLanding ? "bg-primary/6 blur-3xl" : "bg-primary/4 blur-3xl"

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className={`absolute left-1/2 -top-30 h-70 w-70 -translate-x-1/2 rounded-full ${primaryGlow} sm:h-96 sm:w-96`} />
      <div className={`absolute -left-24 top-96 h-64 w-64 rounded-full ${secondaryGlow} sm:h-80 sm:w-80`} />
      <div className={`absolute -right-20 bottom-16 h-56 w-56 rounded-full ${tertiaryGlow} sm:h-72 sm:w-72`} />
    </div>
  )
}