import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { VercelToolbar } from "@vercel/toolbar/next";
import { Navbar } from "@/components/layout/Navbar";
import { GlobalBackground } from "@/components/layout/global-background";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { createSupabaseServerClient } from "@/lib/supabase/server"; // Adicione este import
import "./globals.css";

export const metadata: Metadata = {
  title: "JP Poker Club",
  description: "Base inicial do JP Poker Club com Next.js, Tailwind e shadcn/ui.",
};

// Transforme em async
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // BUSCA DE DADOS NO SERVIDOR (Livre de Race Conditions e RLS bloqueando o frontend)
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialRole = null;
  let initialDisplayName = null;
  let initialBalance = null;

  if (user) {
    const [profileResult, walletResult] = await Promise.all([
      supabase.from("profiles").select("user_role, display_name").eq("id", user.id).maybeSingle(),
      supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle(),
    ]);

    initialRole = profileResult.data?.user_role ?? null;
    initialDisplayName = profileResult.data?.display_name ?? null;
    initialBalance = walletResult.data?.balance != null ? Number(walletResult.data.balance) : null;
  }

  return (
    <html lang="pt-BR">
      <body className="relative min-h-dvh overflow-x-hidden bg-background">
        <GlobalBackground />

        <div className="relative z-0 flex min-h-dvh flex-col overflow-x-hidden">
          {/* PASSA OS DADOS REAIS PARA A NAVBAR */}
          <Navbar 
            initialUserEmail={user?.email ?? null} 
            initialDisplayName={initialDisplayName}
            initialRole={initialRole}
            initialBalance={initialBalance}
          />
          <main className="flex min-h-screen flex-1 flex-col pt-37.5 md:pt-25 lg:pt-28">{children}</main>
          <Footer />
        </div>
        {process.env.NODE_ENV === "development" ? <VercelToolbar /> : null}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}