"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  CalendarDaysIcon,
  ClubIcon,
  LogInIcon,
  LogOutIcon,
  UserRoundIcon,
  TicketPercentIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type NavbarProps = {
  initialUserEmail: string | null
}

export function Navbar({ initialUserEmail }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail)
  const [supabase] = useState(() => createSupabaseBrowserClient())

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const isActive = (href: string) => pathname === href

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error("Nao foi possivel sair agora.")
      return
    }

    toast.success("Logout realizado com sucesso.")
    setUserEmail(null)
    router.replace("/")
    router.refresh()
  }

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
            <UserRoundIcon className="size-4" aria-hidden="true" />
            Início
          </Link>
          <Link
            href="/noticias"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-200 ease-out ${isActive("/noticias")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
          >
            <UserRoundIcon className="size-4" aria-hidden="true" />
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
          {!userEmail ? (
            <Button asChild className="cursor-pointer">
              <Link href="/login">
                <LogInIcon className="size-4" aria-hidden="true" />
                Login
              </Link>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="max-w-[220px]">
                  <UserRoundIcon className="size-4" aria-hidden="true" />
                  <span className="truncate">{userEmail}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
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
            <UserRoundIcon className="size-4" aria-hidden="true" />
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