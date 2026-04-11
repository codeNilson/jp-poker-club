"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type NewsCoverImageFieldProps = {
  inputId: string
  name: string
  label: string
  helpText: string
  defaultPreviewUrl?: string | null
}

export function NewsCoverImageField({ inputId, name, label, helpText, defaultPreviewUrl = null }: NewsCoverImageFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultPreviewUrl)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }

    if (!file) {
      setPreviewUrl(defaultPreviewUrl)
      return
    }

    const nextObjectUrl = URL.createObjectURL(file)
    objectUrlRef.current = nextObjectUrl
    setPreviewUrl(nextObjectUrl)
  }

  return (
    <Field>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <Input
        id={inputId}
        name={name}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="rounded-xl bg-background"
      />
      <FieldDescription>{helpText}</FieldDescription>

      {previewUrl ? (
        <div className="overflow-hidden rounded-2xl border bg-background">
          <img src={previewUrl} alt="Pré-visualização da imagem de capa" className="h-56 w-full object-cover" />
        </div>
      ) : null}
    </Field>
  )
}