export function isNextRedirectError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false
  }

  const errorMessage = "message" in error ? String(error.message) : ""
  const errorDigest = "digest" in error ? String(error.digest) : ""

  return errorMessage.includes("NEXT_REDIRECT") || errorDigest.includes("NEXT_REDIRECT")
}