"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"

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
    <div className="grid gap-2">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="rounded-xl border bg-background px-3 py-2 text-sm"
      />
      <p className="text-xs text-muted-foreground">{helpText}</p>

      {previewUrl ? (
        <div className="overflow-hidden rounded-2xl border bg-background">
          <img src={previewUrl} alt="Pré-visualização da imagem de capa" className="h-56 w-full object-cover" />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
          Nenhuma imagem selecionada.
        </div>
      )}
    </div>
  )
}