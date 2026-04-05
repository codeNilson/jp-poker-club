import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { env } from "@/lib/env"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createSupabaseServerClient()
    
    // Capturamos o erro aqui!
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error("🚨 ERRO GRAVE NO LOGIN:", error.message)
      // Opcional: Redirecionar para uma página de erro do seu site
      // return NextResponse.redirect(`${requestUrl.origin}/login?error=true`)
    } else {
      console.log("✅ Usuário logado com sucesso. Cookies gerados!")
    }
  }

  const redirectUrl = new URL(env.NEXT_PUBLIC_APP_URL ?? requestUrl.origin)
  redirectUrl.pathname = "/"

  return NextResponse.redirect(redirectUrl)
}