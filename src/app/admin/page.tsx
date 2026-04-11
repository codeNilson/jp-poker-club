const ADMIN_MODULES = [
  {
    title: "Noticias",
    description: "Criar, editar, publicar e organizar destaques.",
    href: "/admin/news",
  },
  {
    title: "Eventos",
    description: "Gerenciar torneios e cash games com regras por tipo.",
    href: "/admin/events",
  },
  {
    title: "Carousel",
    description: "Atualizar cards da home e definir ordem de exibicao.",
    href: "/admin/carousel",
  },
  {
    title: "Assinaturas",
    description: "Acompanhar status de assinatura e acoes administrativas.",
    href: "/admin/assinaturas",
  },
  {
    title: "Carteiras",
    description: "Visualizar saldo e preparar ajustes com trilha auditavel.",
    href: "/admin/carteiras",
  },
]

export default function AdminPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-3xl border bg-card p-6">
        <p className="text-sm font-medium text-primary">Painel administrativo</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Gerenciamento do JP Poker Club</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta area eh restrita a perfis com permissao administrativa. Os modulos abaixo serao liberados em fases.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_MODULES.map((module) => {
          const content = (
            <>
              <h2 className="text-base font-semibold text-foreground">{module.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{module.description}</p>
            </>
          )

          if (module.href) {
            return (
              <a
                key={module.title}
                href={module.href}
                className="rounded-2xl border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-card/80"
              >
                {content}
              </a>
            )
          }

          return (
            <article key={module.title} className="rounded-2xl border bg-card p-5">
              {content}
            </article>
          )
        })}
      </div>
    </section>
  )
}
