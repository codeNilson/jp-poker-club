import Link from "next/link"

import { Button } from "@/components/ui/button"
import { getAdminNewsItems } from "@/lib/admin/news"
import { NEWS_CATEGORY_LABELS, NEWS_CATEGORY_OPTIONS } from "@/services/news.service"

import { createNewsAction, deleteNewsAction, updateNewsAction } from "./actions"

type SearchParams = {
  success?: string | string[]
  error?: string | string[]
}

function formatDateTimeLocal(value: string) {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
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

function booleanFieldLabel(value: boolean) {
  return value ? "Sim" : "Nao"
}

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {})
  const notice = parseNotice(resolvedSearchParams)
  const newsItems = await getAdminNewsItems()
  const nowIso = new Date().toISOString()

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-3xl border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-primary">Admin / News</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Gerenciar noticias</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Crie, edite, publique e destaque materias sem sair do painel.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">Voltar ao painel</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/noticias">Ver pagina publica</Link>
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
          <h2 className="text-lg font-semibold">Nova noticia</h2>
          <form action={createNewsAction} className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="create-title" className="text-sm font-medium">
                Titulo
              </label>
              <input id="create-title" name="title" required className="rounded-xl border bg-background px-3 py-2 text-sm" />
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-description" className="text-sm font-medium">
                Descricao curta
              </label>
              <textarea
                id="create-description"
                name="description"
                required
                rows={3}
                className="rounded-xl border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-content" className="text-sm font-medium">
                Conteudo
              </label>
              <textarea
                id="create-content"
                name="content"
                required
                rows={8}
                className="rounded-xl border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-slug" className="text-sm font-medium">
                Slug
              </label>
              <input
                id="create-slug"
                name="slug"
                placeholder="titulo-da-noticia"
                className="rounded-xl border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-category" className="text-sm font-medium">
                Categoria
              </label>
              <select id="create-category" name="category" defaultValue="clube" className="rounded-xl border bg-background px-3 py-2 text-sm">
                {NEWS_CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {NEWS_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-coverImageUrl" className="text-sm font-medium">
                Capa da imagem (opcional)
              </label>
              <input
                id="create-coverImageUrl"
                name="coverImageUrl"
                placeholder="https://..."
                className="rounded-xl border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-readTimeMinutes" className="text-sm font-medium">
                Tempo de leitura
              </label>
              <input
                id="create-readTimeMinutes"
                name="readTimeMinutes"
                type="number"
                min={1}
                max={60}
                defaultValue={3}
                className="rounded-xl border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-publishedAt" className="text-sm font-medium">
                Publicacao
              </label>
              <input
                id="create-publishedAt"
                name="publishedAt"
                type="datetime-local"
                defaultValue={nowIso.slice(0, 16)}
                className="rounded-xl border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                <input type="checkbox" name="isActive" defaultChecked />
                Ativa
              </label>
              <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                <input type="checkbox" name="isFeatured" />
                Destaque
              </label>
              <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                <input type="checkbox" name="isHot" />
                Em alta
              </label>
            </div>

            <Button type="submit" className="w-full">
              Criar noticia
            </Button>
          </form>
        </section>

        <section className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Noticias cadastradas</h2>
            <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
              {newsItems.length} itens
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {newsItems.length > 0 ? (
              newsItems.map((item) => (
                <article key={item.id} className="rounded-3xl border p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span className="rounded-full border px-2.5 py-1 text-foreground">
                      {NEWS_CATEGORY_LABELS[item.category as keyof typeof NEWS_CATEGORY_LABELS] ?? item.category}
                    </span>
                    <span>{formatDisplayDate(item.published_at)}</span>
                    <span>Leitura: {item.read_time_minutes} min</span>
                    <span>Ativa: {booleanFieldLabel(item.is_active)}</span>
                    <span>Hot: {booleanFieldLabel(item.is_hot)}</span>
                    <span>Destaque: {booleanFieldLabel(item.is_featured)}</span>
                  </div>

                  <h3 className="mt-3 text-xl font-semibold leading-tight">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>

                  <details className="mt-5 rounded-2xl border bg-background p-4">
                    <summary className="cursor-pointer text-sm font-medium">Editar noticia</summary>

                    <form action={updateNewsAction} className="mt-4 grid gap-4">
                      <input type="hidden" name="id" value={item.id} />

                      <div className="grid gap-2">
                        <label htmlFor={`title-${item.id}`} className="text-sm font-medium">
                          Titulo
                        </label>
                        <input
                          id={`title-${item.id}`}
                          name="title"
                          required
                          defaultValue={item.title}
                          className="rounded-xl border bg-card px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="grid gap-2">
                        <label htmlFor={`description-${item.id}`} className="text-sm font-medium">
                          Descricao curta
                        </label>
                        <textarea
                          id={`description-${item.id}`}
                          name="description"
                          required
                          rows={3}
                          defaultValue={item.description}
                          className="rounded-xl border bg-card px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="grid gap-2">
                        <label htmlFor={`content-${item.id}`} className="text-sm font-medium">
                          Conteudo
                        </label>
                        <textarea
                          id={`content-${item.id}`}
                          name="content"
                          required
                          rows={7}
                          defaultValue={item.content}
                          className="rounded-xl border bg-card px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="grid gap-2">
                        <label htmlFor={`slug-${item.id}`} className="text-sm font-medium">
                          Slug
                        </label>
                        <input
                          id={`slug-${item.id}`}
                          name="slug"
                          defaultValue={item.slug}
                          className="rounded-xl border bg-card px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="grid gap-2">
                        <label htmlFor={`category-${item.id}`} className="text-sm font-medium">
                          Categoria
                        </label>
                        <select
                          id={`category-${item.id}`}
                          name="category"
                          defaultValue={item.category}
                          className="rounded-xl border bg-card px-3 py-2 text-sm"
                        >
                          {NEWS_CATEGORY_OPTIONS.map((category) => (
                            <option key={category} value={category}>
                              {NEWS_CATEGORY_LABELS[category]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid gap-2">
                        <label htmlFor={`coverImageUrl-${item.id}`} className="text-sm font-medium">
                          Capa da imagem (opcional)
                        </label>
                        <input
                          id={`coverImageUrl-${item.id}`}
                          name="coverImageUrl"
                          defaultValue={item.cover_image_url ?? ""}
                          className="rounded-xl border bg-card px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="grid gap-2">
                        <label htmlFor={`readTimeMinutes-${item.id}`} className="text-sm font-medium">
                          Tempo de leitura
                        </label>
                        <input
                          id={`readTimeMinutes-${item.id}`}
                          name="readTimeMinutes"
                          type="number"
                          min={1}
                          max={60}
                          defaultValue={item.read_time_minutes}
                          className="rounded-xl border bg-card px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="grid gap-2">
                        <label htmlFor={`publishedAt-${item.id}`} className="text-sm font-medium">
                          Publicacao
                        </label>
                        <input
                          id={`publishedAt-${item.id}`}
                          name="publishedAt"
                          type="datetime-local"
                          defaultValue={formatDateTimeLocal(item.published_at)}
                          className="rounded-xl border bg-card px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                          <input type="checkbox" name="isActive" defaultChecked={item.is_active} />
                          Ativa
                        </label>
                        <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                          <input type="checkbox" name="isFeatured" defaultChecked={item.is_featured} />
                          Destaque
                        </label>
                        <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                          <input type="checkbox" name="isHot" defaultChecked={item.is_hot} />
                          Em alta
                        </label>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button type="submit">Salvar alteracoes</Button>
                        <Button asChild variant="outline">
                          <Link href={`/noticias/${item.slug}`}>Abrir pagina publica</Link>
                        </Button>
                      </div>
                    </form>
                  </details>

                  <form action={deleteNewsAction} className="mt-4">
                    <input type="hidden" name="id" value={item.id} />
                    <Button type="submit" variant="destructive" size="sm">
                      Excluir noticia
                    </Button>
                  </form>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                Nenhuma noticia cadastrada ainda.
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
