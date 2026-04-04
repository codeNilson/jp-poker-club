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
      <body className="min-h-dvh">
        <div className="flex min-h-dvh flex-col">
          <Navbar initialUserEmail={initialUserEmail} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
