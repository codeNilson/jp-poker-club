"use client"

import { useEffect } from "react"

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

type SlugAutofillSyncProps = {
  titleInputId: string
  slugInputId: string
}

export function SlugAutofillSync({ titleInputId, slugInputId }: SlugAutofillSyncProps) {
  useEffect(() => {
    const titleInput = document.getElementById(titleInputId) as HTMLInputElement | null
    const slugInput = document.getElementById(slugInputId) as HTMLInputElement | null

    if (!titleInput || !slugInput) {
      return
    }

    let slugManuallyEdited = slugInput.value.trim().length > 0

    const handleTitleInput = () => {
      if (slugManuallyEdited) {
        return
      }

      slugInput.value = slugify(titleInput.value)
    }

    const handleSlugInput = () => {
      const normalized = slugify(slugInput.value)

      if (slugInput.value !== normalized) {
        slugInput.value = normalized
      }

      slugManuallyEdited = slugInput.value.trim().length > 0
    }

    titleInput.addEventListener("input", handleTitleInput)
    slugInput.addEventListener("input", handleSlugInput)

    // Fill slug from current title on first load when slug is empty.
    handleTitleInput()

    return () => {
      titleInput.removeEventListener("input", handleTitleInput)
      slugInput.removeEventListener("input", handleSlugInput)
    }
  }, [titleInputId, slugInputId])

  return null
}