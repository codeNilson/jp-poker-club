import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { env } from "@/lib/env"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  const redirectUrl = new URL(env.NEXT_PUBLIC_APP_URL ?? requestUrl.origin)
  redirectUrl.pathname = "/"

  return NextResponse.redirect(redirectUrl)
}
