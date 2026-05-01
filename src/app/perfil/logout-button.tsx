"use client"

import { LogOutIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutAction } from "./actions"

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button
        type="submit"
        variant="outline"
        className="perfil-btn-secondary w-full"
      >
        <LogOutIcon size={20} />
        Sair da Conta
      </Button>
    </form>
  )
}
