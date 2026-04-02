import "server-only";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url().optional(),
  NEXT_PUBLIC_APP_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  ABACATEPAY_API_KEY: z.string().optional(),
  PAGARME_SECRET_KEY: z.string().optional(),
  PAGARME_WEBHOOK_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);