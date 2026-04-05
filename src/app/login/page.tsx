"use client"

import { useState } from "react"
import { LogInIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [supabase] = useState(() => createSupabaseBrowserClient())

  async function handleGoogleLogin() {
    setIsLoading(true)

    const origin = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const redirectTo = `${origin}/auth/callback`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    })

    if (error) {
      console.error("🚨 Falha ao iniciar OAuth:", error.message)
      setIsLoading(false)
      return
    }

  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-md items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full rounded-3xl border bg-card p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Acesso</p>
          <h1 className="text-2xl font-semibold tracking-tight">Entrar no JP Poker Club</h1>
          <p className="text-sm text-muted-foreground">Entre com sua conta para acessar sua área.</p>
        </div>

        <Button className="mt-8 w-full cursor-pointer" onClick={handleGoogleLogin} disabled={isLoading}>
          <LogInIcon className="size-4" aria-hidden="true" />
          {isLoading ? "Redirecionando..." : "Login"}
        </Button>
      </div>
    </section>
  )
}