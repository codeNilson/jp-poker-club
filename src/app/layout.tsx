import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { VercelToolbar } from "@vercel/toolbar/next";
import { Navbar } from "@/components/layout/Navbar";
import { GlobalBackground } from "@/components/layout/global-background";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";


export const metadata: Metadata = {
  title: "JP Poker Club",
  description: "Base inicial do JP Poker Club com Next.js, Tailwind e shadcn/ui.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="relative min-h-dvh overflow-x-hidden bg-background">
        <GlobalBackground />

        <div className="relative z-0 flex min-h-dvh flex-col">
          <Navbar initialUserEmail={null} />
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
