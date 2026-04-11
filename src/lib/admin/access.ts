import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export const ADMIN_ALLOWED_ROLES = ["admin", "operator"] as const

export type AdminRole = (typeof ADMIN_ALLOWED_ROLES)[number]

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

function isAllowedAdminRole(role: string | null | undefined): role is AdminRole {
  return Boolean(role && ADMIN_ALLOWED_ROLES.includes(role as AdminRole))
}

export async function getAdminAccess(client?: SupabaseServerClient) {
  const supabase = client ?? (await createSupabaseServerClient())

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      supabase,
      user: null,
      role: null,
      hasAccess: false,
    }
  }

  const { data: profile } = await supabase.from("profiles").select("user_role").eq("id", user.id).maybeSingle()

  const role = profile?.user_role ?? null

  return {
    supabase,
    user,
    role,
    hasAccess: isAllowedAdminRole(role),
  }
}