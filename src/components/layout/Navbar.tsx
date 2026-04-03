"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  CalendarDaysIcon,
  ClubIcon,
  LogOutIcon,
  Spade,
  TicketPercentIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const pathname = usePathname()
  const isLoggedIn = false

  const isActive = (href: string) => pathname === href

  return (
    <header className="border-b bg-background/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex w-full items-center justify-between gap-3">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full px-2 py-1">
          <ClubIcon className="size-5" aria-hidden="true" />
          <span className="font-semibold">JP Poker Club</span>
        </Link>

        <nav
          aria-label="Navegacao principal"
          className="hidden items-center rounded-full bg-muted p-1 md:flex"
        >
          <Link
            href="/"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-200 ease-out ${isActive("/")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
          >
            <Spade className="size-4" aria-hidden="true" />
            Início
          </Link>
          <Link
            href="/noticias"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-200 ease-out ${isActive("/noticias")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
          >
            <Spade className="size-4" aria-hidden="true" />
            Noticias
          </Link>
          <Link
            href="/eventos"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-200 ease-out ${isActive("/eventos")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
          >
            <CalendarDaysIcon className="size-4" aria-hidden="true" />
            Eventos
          </Link>
          <Link
            href="/promocoes"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-200 ease-out ${isActive("/promocoes")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
          >
            <TicketPercentIcon className="size-4" aria-hidden="true" />
            Promocoes
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {!isLoggedIn ? (
            <Button className="cursor-pointer">Login</Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Minha Conta</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <LogOutIcon className="size-4" aria-hidden="true" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <nav aria-label="Navegacao principal mobile" className="mt-3 md:hidden">
        <div className="flex items-center gap-2 rounded-full bg-muted p-1">
          <Link
            href="/noticias"
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-200 ease-out ${isActive("/noticias")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
          >
            <Spade className="size-4" aria-hidden="true" />
            Noticias
          </Link>
          <Link
            href="/eventos"
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-200 ease-out ${isActive("/eventos")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
          >
            <CalendarDaysIcon className="size-4" aria-hidden="true" />
            Eventos
          </Link>
          <Link
            href="/promocoes"
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-200 ease-out ${isActive("/promocoes")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
          >
            <TicketPercentIcon className="size-4" aria-hidden="true" />
            Promocoes
          </Link>
        </div>
      </nav>
    </header>
  )
}