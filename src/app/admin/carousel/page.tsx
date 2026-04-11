import Link from "next/link"

import { Button } from "@/components/ui/button"
import { getAdminCarouselItems } from "@/lib/admin/carousel"

import {
  createCarouselItemAction,
  deleteCarouselItemAction,
  updateCarouselItemAction,
} from "./actions"

type SearchParams = {
  success?: string | string[]
  error?: string | string[]
}

function parseNotice(searchParams: SearchParams) {
  const successParam = Array.isArray(searchParams.success) ? searchParams.success[0] : searchParams.success
  const errorParam = Array.isArray(searchParams.error) ? searchParams.error[0] : searchParams.error

  if (errorParam) {
    return { type: "error" as const, message: errorParam }
  }

  if (successParam) {
    return { type: "success" as const, message: successParam }
  }

  return null
}

export default async function AdminCarouselPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {})
  const notice = parseNotice(resolvedSearchParams)
  const carouselItems = await getAdminCarouselItems()

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-3xl border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-primary">Admin / Carousel</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Gerenciar carousel</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Controle os cards da home com ordem, visibilidade e links de navegacao.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">Voltar ao painel</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/">Ver home publica</Link>
          </Button>
        </div>
      </header>

      {notice ? (
        <div
          className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
            notice.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {notice.message}
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-3xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Novo card</h2>
          <form action={createCarouselItemAction} className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="create-title" className="text-sm font-medium">
                Titulo
              </label>
              <input id="create-title" name="title" required className="rounded-xl border bg-background px-3 py-2 text-sm" />
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-description" className="text-sm font-medium">
                Descricao
              </label>
              <textarea id="create-description" name="description" rows={3} className="rounded-xl border bg-background px-3 py-2 text-sm" />
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-desktopImageUrl" className="text-sm font-medium">
                Imagem desktop (URL)
              </label>
              <input id="create-desktopImageUrl" name="desktopImageUrl" required className="rounded-xl border bg-background px-3 py-2 text-sm" />
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-mobileImageUrl" className="text-sm font-medium">
                Imagem mobile (URL)
              </label>
              <input id="create-mobileImageUrl" name="mobileImageUrl" required className="rounded-xl border bg-background px-3 py-2 text-sm" />
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-actionText" className="text-sm font-medium">
                CTA
              </label>
              <input id="create-actionText" name="actionText" defaultValue="Saiba mais" className="rounded-xl border bg-background px-3 py-2 text-sm" />
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-linkUrl" className="text-sm font-medium">
                Link de destino
              </label>
              <input id="create-linkUrl" name="linkUrl" defaultValue="/" className="rounded-xl border bg-background px-3 py-2 text-sm" />
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-sortOrder" className="text-sm font-medium">
                Ordem
              </label>
              <input id="create-sortOrder" name="sortOrder" type="number" min={0} defaultValue={0} className="rounded-xl border bg-background px-3 py-2 text-sm" />
            </div>

            <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked />
              Ativo
            </label>

            <Button type="submit" className="w-full">
              Criar card
            </Button>
          </form>
        </section>

        <section className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Cards cadastrados</h2>
            <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
              {carouselItems.length} itens
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {carouselItems.length > 0 ? (
              carouselItems.map((item) => (
                <article key={item.id} className="rounded-3xl border p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span>Ordem: {item.sort_order}</span>
                    <span>Ativo: {item.is_active ? "Sim" : "Nao"}</span>
                  </div>

                  <h3 className="mt-3 text-xl font-semibold leading-tight">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description ?? "Sem descricao."}</p>

                  <details className="mt-5 rounded-2xl border bg-background p-4">
                    <summary className="cursor-pointer text-sm font-medium">Editar card</summary>

                    <form action={updateCarouselItemAction} className="mt-4 grid gap-4">
                      <input type="hidden" name="id" value={item.id} />

                      <div className="grid gap-2">
                        <label htmlFor={`title-${item.id}`} className="text-sm font-medium">
                          Titulo
                        </label>
                        <input id={`title-${item.id}`} name="title" required defaultValue={item.title} className="rounded-xl border bg-card px-3 py-2 text-sm" />
                      </div>

                      <div className="grid gap-2">
                        <label htmlFor={`description-${item.id}`} className="text-sm font-medium">
                          Descricao
                        </label>
                        <textarea id={`description-${item.id}`} name="description" rows={3} defaultValue={item.description ?? ""} className="rounded-xl border bg-card px-3 py-2 text-sm" />
                      </div>

                      <div className="grid gap-2">
                        <label htmlFor={`desktopImageUrl-${item.id}`} className="text-sm font-medium">
                          Imagem desktop
                        </label>
                        <input id={`desktopImageUrl-${item.id}`} name="desktopImageUrl" required defaultValue={item.desktop_image_url} className="rounded-xl border bg-card px-3 py-2 text-sm" />
                      </div>

                      <div className="grid gap-2">
                        <label htmlFor={`mobileImageUrl-${item.id}`} className="text-sm font-medium">
                          Imagem mobile
                        </label>
                        <input id={`mobileImageUrl-${item.id}`} name="mobileImageUrl" required defaultValue={item.mobile_image_url} className="rounded-xl border bg-card px-3 py-2 text-sm" />
                      </div>

                      <div className="grid gap-2">
                        <label htmlFor={`actionText-${item.id}`} className="text-sm font-medium">
                          CTA
                        </label>
                        <input id={`actionText-${item.id}`} name="actionText" defaultValue={item.action_text} className="rounded-xl border bg-card px-3 py-2 text-sm" />
                      </div>

                      <div className="grid gap-2">
                        <label htmlFor={`linkUrl-${item.id}`} className="text-sm font-medium">
                          Link de destino
                        </label>
                        <input id={`linkUrl-${item.id}`} name="linkUrl" defaultValue={item.link_url} className="rounded-xl border bg-card px-3 py-2 text-sm" />
                      </div>

                      <div className="grid gap-2">
                        <label htmlFor={`sortOrder-${item.id}`} className="text-sm font-medium">
                          Ordem
                        </label>
                        <input id={`sortOrder-${item.id}`} name="sortOrder" type="number" min={0} defaultValue={item.sort_order} className="rounded-xl border bg-card px-3 py-2 text-sm" />
                      </div>

                      <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                        <input type="checkbox" name="isActive" defaultChecked={item.is_active} />
                        Ativo
                      </label>

                      <div className="flex flex-wrap gap-3">
                        <Button type="submit">Salvar alteracoes</Button>
                      </div>
                    </form>
                  </details>

                  <form action={deleteCarouselItemAction} className="mt-4">
                    <input type="hidden" name="id" value={item.id} />
                    <Button type="submit" variant="destructive" size="sm">
                      Excluir card
                    </Button>
                  </form>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                Nenhum card cadastrado ainda.
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
