import type { NextConfig } from "next"
import withVercelToolbar from "@vercel/toolbar/plugins/next"

const SUPABASE_PUBLIC_BUCKET_PATH = "/storage/v1/object/public/jp-poker-club-image-vault/**"
const NEWS_CATEGORY_PATH_PATTERN = "(?<category>clube|eventos|ranking|assinatura|comunicado|promocao)"

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
  async redirects() {
    return [
      {
        source: "/noticias",
        has: [{ type: "query", key: "category", value: NEWS_CATEGORY_PATH_PATTERN }],
        destination: "/noticias/categoria/:category",
        permanent: true,
      },
      {
        source: "/noticias/todas",
        has: [
          { type: "query", key: "category", value: NEWS_CATEGORY_PATH_PATTERN },
          { type: "query", key: "page", value: "(?<page>.*)" },
        ],
        destination: "/noticias/todas/categoria/:category?page=:page",
        permanent: true,
      },
      {
        source: "/noticias/todas",
        has: [{ type: "query", key: "category", value: NEWS_CATEGORY_PATH_PATTERN }],
        destination: "/noticias/todas/categoria/:category",
        permanent: true,
      },
    ]
  },
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

export default withVercelToolbar()(nextConfig)