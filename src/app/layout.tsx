import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
