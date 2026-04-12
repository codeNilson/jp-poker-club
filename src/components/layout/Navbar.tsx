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

const ADMIN_ALLOWED_ROLES = ["admin", "operator"] as const

function canAccessAdmin(role: string | null) {
  return Boolean(role && ADMIN_ALLOWED_ROLES.includes(role as (typeof ADMIN_ALLOWED_ROLES)[number]))
}

export function Navbar({ initialUserEmail }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isHidden, setIsHidden] = useState(false)
  const [supabase] = useState(() => createSupabaseBrowserClient())

  useEffect(() => {
    async function syncUserState() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setUserEmail(null)
        setUserRole(null)
        return
      }

      setUserEmail(user.email ?? null)

      const { data: profile } = await supabase.from("profiles").select("user_role").eq("id", user.id).maybeSingle()
      setUserRole(profile?.user_role ?? null)
    }

    syncUserState().catch(() => {
      setUserRole(null)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUserEmail(null)
        setUserRole(null)
        return
      }

      setUserEmail(session.user.email ?? null)

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_role")
        .eq("id", session.user.id)
        .maybeSingle()

      setUserRole(profile?.user_role ?? null)
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

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const showAdminLink = canAccessAdmin(userRole)

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error("Nao foi possivel sair agora.")
      return
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
                <Button variant="outline" className="max-w-35 sm:max-w-55">
                  <UserRoundIcon className="size-4" aria-hidden="true" />
                  <span className="truncate">{userEmail}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {showAdminLink ? (
                  <DropdownMenuItem onClick={() => router.push("/admin")}>
                    <ShieldCheckIcon className="size-4" aria-hidden="true" />
                    Admin
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOutIcon className="size-4" aria-hidden="true" />
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