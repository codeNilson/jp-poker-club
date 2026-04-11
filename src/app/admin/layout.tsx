import { redirect } from "next/navigation"

import { getAdminAccess } from "@/lib/admin/access"

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, hasAccess } = await getAdminAccess()

  if (!user) {
    redirect("/login")
  }

  if (!hasAccess) {
    redirect("/")
  }

  return <>{children}</>
}
