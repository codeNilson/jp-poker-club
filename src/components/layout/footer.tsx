import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background/95 px-4 py-6 backdrop-blur sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">codeNilson</p>
          <a
            href="mailto:fcodenilson@gmail.com"
            className="underline-offset-4 hover:underline"
          >
            fcodenilson@gmail.com
          </a>
        </div>

        <nav aria-label="Links do rodape" className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/politicas-de-privacidade" className="underline-offset-4 hover:underline">
            Politicas de Privacidade
          </Link>
          <Link href="/termos-de-uso" className="underline-offset-4 hover:underline">
            Termos de Uso
          </Link>
          <Link href="/fale-conosco" className="underline-offset-4 hover:underline">
            Fale Conosco
          </Link>
        </nav>
      </div>
    </footer>
  );
}