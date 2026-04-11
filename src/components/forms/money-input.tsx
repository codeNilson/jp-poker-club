"use client"

import { useEffect, useState } from "react"
import type { ComponentProps } from "react"

import { Input } from "@/components/ui/input"

type MoneyInputProps = Omit<ComponentProps<typeof Input>, "type" | "value" | "defaultValue" | "onChange"> & {
  defaultValue?: number | string | null
}

function formatMoneyInput(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function parseMoneyDigits(value: string) {
  const digits = value.replace(/\D/g, "")

  if (!digits) {
    return ""
  }

  return formatMoneyInput(Number(digits) / 100)
}

export function MoneyInput({ defaultValue, className, id, name, ...props }: MoneyInputProps) {
  const [displayValue, setDisplayValue] = useState(() => {
    if (typeof defaultValue === "number" && Number.isFinite(defaultValue)) {
      return formatMoneyInput(defaultValue)
    }

    if (typeof defaultValue === "string" && defaultValue.trim()) {
      return parseMoneyDigits(defaultValue)
    }

    return ""
  })

  useEffect(() => {
    if (typeof defaultValue === "number" && Number.isFinite(defaultValue)) {
      setDisplayValue(formatMoneyInput(defaultValue))
      return
    }

    if (typeof defaultValue === "string" && defaultValue.trim()) {
      setDisplayValue(parseMoneyDigits(defaultValue))
      return
    }

    setDisplayValue("")
  }, [defaultValue])

  return (
    <Input
      {...props}
      id={id}
      name={name}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder="R$ 0,00"
      value={displayValue}
      onChange={(event) => setDisplayValue(parseMoneyDigits(event.target.value))}
      className={className}
    />
  )
}