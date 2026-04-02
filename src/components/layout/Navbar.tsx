"use client"

import Link from "next/link"
import { ClubIcon, LogOutIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const isLoggedIn = false

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
            href="/noticias"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            Notícias
          </Link>
          <Link
            href="/eventos"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            Eventos
          </Link>
          <Link
            href="/sobre"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            Sobre
          </Link>
        </nav>

        <div className="flex items-center">
          {!isLoggedIn ? (
            <Button>Login</Button>
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
    </header>
  )
}