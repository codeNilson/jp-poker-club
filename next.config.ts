import type { NextConfig } from "next"

const SUPABASE_PUBLIC_BUCKET_PATH = "/storage/v1/object/public/jp-poker-club-image-vault/**"

function getSupabaseHostname() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl) {
    return null
  }

  try {
    return new URL(supabaseUrl).hostname
  } catch {
    return null
  }
}

const supabaseHostname = getSupabaseHostname()

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "54321",
        pathname: SUPABASE_PUBLIC_BUCKET_PATH,
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: SUPABASE_PUBLIC_BUCKET_PATH,
      },
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              port: "",
              pathname: SUPABASE_PUBLIC_BUCKET_PATH,
            },
          ]
        : []),
    ],
  },
}

export default nextConfig