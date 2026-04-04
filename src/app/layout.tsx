import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "JP Poker Club",
  description: "Base inicial do JP Poker Club com Next.js, Tailwind e shadcn/ui.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getUser()
  const initialUserEmail = data.user?.email ?? null

  return (
    <html lang="pt-BR">
      <body className="relative min-h-dvh overflow-x-hidden bg-background">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 -top-30 h-70 w-70 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl sm:h-96 sm:w-96" />
          <div className="absolute -left-24 top-96 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl sm:h-80 sm:w-80" />
          <div className="absolute -right-20 bottom-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl sm:h-72 sm:w-72" />
        </div>

        <div className="relative z-0 flex min-h-dvh flex-col">
          <Navbar initialUserEmail={initialUserEmail} />
          <main className="flex min-h-screen flex-1 flex-col pt-37.5 md:pt-25 lg:pt-28">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
