import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { env } from "@/lib/env"
import { getAdminAccess } from "@/lib/admin/access"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  let redirectPath = "/"

  if (code) {
    const supabase = await createSupabaseServerClient()

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { hasAccess } = await getAdminAccess(supabase)

      if (hasAccess) {
        redirectPath = "/admin"
      }
    }

  }

  const redirectUrl = new URL(env.NEXT_PUBLIC_APP_URL ?? requestUrl.origin)
  redirectUrl.pathname = redirectPath

  return NextResponse.redirect(redirectUrl)
}