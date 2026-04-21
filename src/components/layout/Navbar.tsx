"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  CalendarDaysIcon,
  ClubIcon,
  LogInIcon,
  LogOutIcon,
  ShieldCheckIcon,
  UserRoundIcon,
  WalletIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type NavbarProps = {
  initialUserEmail: string | null
}

const ADMIN_ALLOWED_ROLES = ["admin", "operator"] as const

function canAccessAdmin(role: string | null) {
  return Boolean(role && ADMIN_ALLOWED_ROLES.includes(role as (typeof ADMIN_ALLOWED_ROLES)[number]))
}

function formatCurrency(value: number | null): string {
  if (value === null) return "R$ --"
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function Navbar({ initialUserEmail }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [isHidden, setIsHidden] = useState(false)
  const [supabase] = useState(() => createSupabaseBrowserClient())

  useEffect(() => {
    async function syncUserState() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setUserEmail(null)
        setDisplayName(null)
        setUserRole(null)
        setWalletBalance(null)
        return
      }

      setUserEmail(user.email ?? null)

      const [profileResult, walletResult] = await Promise.all([
        supabase.from("profiles").select("user_role, display_name").eq("id", user.id).maybeSingle(),
        supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle(),
      ])

      setUserRole(profileResult.data?.user_role ?? null)
      setDisplayName(profileResult.data?.display_name ?? null)
      setWalletBalance(walletResult.data?.balance != null ? Number(walletResult.data.balance) : null)
    }

    syncUserState().catch(() => {
      setUserRole(null)
      setWalletBalance(null)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUserEmail(null)
        setDisplayName(null)
        setUserRole(null)
        setWalletBalance(null)
        return
      }

      setUserEmail(session.user.email ?? null)

      const [profileResult, walletResult] = await Promise.all([
        supabase.from("profiles").select("user_role, display_name").eq("id", session.user.id).maybeSingle(),
        supabase.from("wallets").select("balance").eq("user_id", session.user.id).maybeSingle(),
      ])

      setUserRole(profileResult.data?.user_role ?? null)
      setDisplayName(profileResult.data?.display_name ?? null)
      setWalletBalance(walletResult.data?.balance != null ? Number(walletResult.data.balance) : null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    let previousScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const isMobile = window.innerWidth < 768

      if (!isMobile) {
        setIsHidden(false)
        previousScrollY = currentScrollY
        return
      }

      if (currentScrollY <= 0) {
        setIsHidden(false)
        previousScrollY = currentScrollY
        return
      }

      setIsHidden(currentScrollY > previousScrollY)
      previousScrollY = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [])

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  const showAdminLink = canAccessAdmin(userRole)

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.warn("Erro ao deslogar no servidor (sessão possivelmente já morta)")
    }

    toast.success("Logout realizado com sucesso.")
    setUserEmail(null)
    setUserRole(null)
    router.replace("/")
    router.refresh()
  }

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b bg-background/95 px-4 py-3 backdrop-blur transition-transform duration-300 md:translate-y-0 sm:px-6 lg:px-8 ${isHidden ? "-translate-y-full" : "translate-y-0"
        }`}
    >
      <div className="flex w-full flex-nowrap items-center justify-between gap-2 sm:gap-3">
        <Link href="/" className="inline-flex min-w-0 items-center gap-2 rounded-full px-2 py-1">
          <ClubIcon className="size-5" aria-hidden="true" />
          <span className="truncate text-sm font-semibold sm:text-base">JP Poker Club</span>
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
            href="/eventos"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-200 ease-out ${isActive("/eventos")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
          >
            <CalendarDaysIcon className="size-4" aria-hidden="true" />
            Eventos
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
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
                <Button variant="outline" className="max-w-44 sm:max-w-60 gap-2">
                  <UserRoundIcon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="flex min-w-0 flex-col items-start leading-tight">
                    <span className="truncate text-xs font-semibold">
                      {displayName ?? userEmail}
                    </span>
                    <span className="text-[10px] text-primary font-medium tabular-nums">
                      {formatCurrency(walletBalance)}
                    </span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/perfil" className="cursor-pointer w-full">
                    <UserRoundIcon className="size-4 mr-2" aria-hidden="true" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/carteira" className="cursor-pointer w-full">
                    <WalletIcon className="size-4 mr-2" aria-hidden="true" />
                    Minha Carteira
                  </Link>
                </DropdownMenuItem>

                {showAdminLink ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer w-full">
                        <ShieldCheckIcon className="size-4 mr-2" aria-hidden="true" />
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : null}

                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer">
                  <LogOutIcon className="size-4 mr-2" aria-hidden="true" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <nav
        aria-label="Navegacao principal mobile"
        className="mt-3 flex justify-center overflow-x-auto md:hidden [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-fit items-center gap-1 rounded-full bg-muted p-1">
          <Link
            href="/"
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-200 ease-out ${isActive("/")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
          >
            <UserRoundIcon className="size-4" aria-hidden="true" />
            Início
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
        </div>
      </nav>
    </header>
  )
}