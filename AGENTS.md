<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Regras

- Só mexa no arquivo readme.md se for solicitado.

## Tema

- Tema padrão sempre escuro, sem toggle light/dark.
- Usar como base visual: --primary #32e035, --background #070707, --card e --muted #121217.

## UI e Layout

- UI do JP Poker Club usa cantos arredondados.
- Preferir componentes de src/components/ui antes de criar novos.
- Sempre considerar o layout mobile primeiro.
- Para mensagens toast, usar o Sonner (src/components/ui/sonner.tsx) como padrão quando necessário.

## Navegação

- Manter consistência de estado ativo, hover e transições suaves em navegação e outros controles visuais.
- Para redirecionamentos internos, usar `useRouter` com `router.push()` ou `router.replace()` e `router.refresh()` quando precisar refletir sessão/SSR; evitar `window.location.assign()` para não forçar reload completo.
- Reservar `window.location.assign()` apenas para fluxos externos ou redirecionamentos absolutos fora do app.
- Componentes visíveis de autenticação devem receber o estado inicial da sessão via server/SSR quando possível, para evitar FOUC; `useEffect` no client deve servir apenas para sincronização posterior.

## Estrutura do Projeto

- src/app contém rotas, layouts e páginas.
- src/components contém componentes reutilizáveis, com prioridade para src/components/ui antes de criar novos.
- src/lib contém utilitários e integrações.
- src/lib/supabase contém os clients do Supabase para browser, server/SSR e admin.
- src/types/database.ts é gerado automaticamente e não deve ser editado manualmente.
- supabase/migrations guarda as migrations versionadas do banco.
- public guarda assets estáticos.
- src/data, src/constants, src/services e src/hooks separam dados, constantes, regras de acesso e hooks.

## Onde Procurar

- Mudança de banco: olhar primeiro supabase/migrations.
- Integração com Supabase: olhar src/lib/supabase.
- UI nova: olhar primeiro src/components/ui e depois os componentes de layout.
- Rota ou página: olhar src/app.

## Decisões de Arquitetura

- Qualquer mudança que altere schema, relações, RLS, fluxo de auth, ou organização estrutural do projeto deve ser registrada aqui.
- Se a mudança impactar Supabase, o schema deve ser definido em migration versionada, nunca apenas no painel.
- Se uma decisão mudar onde algo deve viver no projeto, atualizar esta documentação antes de continuar com implementações relacionadas.

## Regras de Arquitetura e Cache

- **Estratégia "Cache by Default":** Assuma que toda página (Server Component) deve ser renderizada estaticamente, a menos que haja um requisito explícito para dados em tempo real ou dependência da sessão do usuário.
- **Páginas Dinâmicas (Sem Cache):**
  - **Quando usar:** Páginas privadas (Dashboard, Wallet, Perfil) ou rotas que leem parâmetros de URL (`searchParams`).
  - **Regra de Implementação:** Nestes casos, você deve usar o `createSupabaseServerClient` (que lê cookies). Apenas a leitura de cookies ou `searchParams` já força a página a ser dinâmica. Se estritamente necessário, declare `export const dynamic = 'force-dynamic'`.
- **Páginas Estáticas (Cache Indefinido ou por Tempo):**
  - **Quando usar:** Páginas públicas que são idênticas para todos os visitantes.
  - **Regra de Implementação:** NÃO leia cookies no servidor para essas rotas. Use EXCLUSIVAMENTE o `createSupabaseServerPublicClient` (com `persistSession: false`) para buscar dados públicos no Supabase, garantindo que o Next.js não desative o cache estático.
  - **Cache Indefinido:** Para rotas institucionais (Termos, Privacidade), não adicione nenhuma variável de revalidação. Essas páginas permanecem em cache estático até o próximo build/deploy.
  - **Cache por Tempo:** Para rotas vitrines que mudam com frequência moderada, adicione `export const revalidate = 3600` (ou outro tempo apropriado) no topo da `page.tsx`.
- **Server Actions e Revalidação Sob Demanda:** TODA vez que você for criar ou editar uma Server Action que faz mutação no banco de dados (INSERT, UPDATE, DELETE), principalmente no Painel Admin, você DEVE obrigatoriamente incluir o `revalidatePath()` do Next.js para limpar o cache das rotas públicas afetadas por aquela mudança.
- **Lembrete Pendente (Noticias):** Este item e apenas um lembrete de arquitetura. A implementacao sera solicitada futuramente pelo solicitante.
- **Estrategia Escolhida (Noticias):** Manter cache no servidor para paginas publicas e invalidar sob demanda quando houver mudanca em `news`.
  - No fluxo interno do app (create, update, delete, publish, unpublish), invalidar cache com `revalidatePath()` ou `revalidateTag()`.
  - Como fallback, configurar webhook do Supabase para um endpoint interno de invalidacao, cobrindo mudancas feitas fora do app (painel do Supabase, scripts, integracoes).
  - Seguranca do webhook: usar segredo dedicado por ambiente (dev e producao com secrets diferentes) e validar obrigatoriamente a assinatura/header secreto no endpoint antes de executar qualquer invalidacao.
  - Objetivo: evitar pagina publica dinamica batendo no banco em toda requisicao, mantendo conteudo atualizado apos mutacoes.
- **O Dilema da Navbar (Client vs Server):** O Layout base (`RootLayout`) nunca deve ler cookies no servidor para não contaminar o site inteiro. Componentes visuais globais que dependem de sessão (como Navbar mostrando o usuário) devem ser Client Components (`"use client"`) e buscar a sessão ativamente via `createSupabaseBrowserClient`, usando Skeleton Loaders para evitar FOUC (Flash of Unstyled Content).

## Linguagem de Produto

- Evitar texto técnico para o usuário final em telas, especialmente em login, onboarding e mensagens de ajuda.
- Preferir copy curta, simples e direta para ações do usuário.
- Se uma mudança de UX ou arquitetura afetar o comportamento visível do app, registrar a decisão aqui antes de seguir com novas implementações.

## Supabase

- Não editar manualmente src/types/database.ts; arquivo gerado automaticamente.
- Após criar ou alterar tabelas no Supabase, regenerar src/types/database.ts.
- O schema do Supabase deve ser tratado como código e versionado em supabase/migrations.
- Usar src/lib/supabase/client.ts no browser.
- Usar src/lib/supabase/server.ts no server/SSR com cookies em getAll/setAll.
- Usar src/lib/supabase/admin.ts somente no servidor para operações administrativas.

## Domínio de Dados

- auth.users é a fonte de verdade da autenticação; novas contas devem gerar perfil e carteira automaticamente.
- profiles guarda o perfil do jogador e a camada de negócio do usuário: display_name, avatar_url, elo_points, elo_tier, is_subscriber e user_role.
- wallets guarda o saldo atual do jogador; balance é campo persistido e deve ser atualizado em conjunto com cada movimentação.
- wallet_transactions é o histórico/auditoria da carteira; cada movimento deve registrar amount, balance_before, balance_after, type e referência opcional.
- subscriptions controla o estado da assinatura por usuário; status indica a situação atual e is_subscriber em profiles deve refletir essa condição quando aplicável.
- events representa torneios/eventos; cada evento tem status, buy_in, data, limite de jogadores e campos opcionais de destaque (featured_title, featured_short_desc, featured_image_url, is_featured) para uso em home e radar.
- news representa as noticias/editoriais do clube; cada registro tem title, description, content, slug, category, published_at, is_active, is_featured, is_hot, read_time_minutes e cover_image_url opcional.
- news.is_featured deve funcionar como destaque global exclusivo entre noticias ativas; quando nao houver destaque ativo, a UI pode cair para a noticia mais recente.
- news.is_hot e apenas um selo visual de relevancia e pode coexistir em varias noticias ao mesmo tempo.
- news nao deve receber imagem ficticia no banco; quando nao houver banner real, a UI deve simplesmente ocultar o bloco de imagem.
- tournament_entries registra o resultado de cada jogador em cada evento; final_position e points_earned são a base para o ranking de Elo.
- O radar da semana deve ser montado a partir de dados reais do banco, combinando eventos proximos e noticias publicadas recentemente, sem hardcode na UI.

## Fluxo Esperado

- Novo usuário: auth.users dispara criação de profiles e wallets.
- Login: a sessão vem do Supabase Auth; o app lê o usuário logado e o perfil correspondente.
- Depósito: gera wallet_transactions e atualiza wallets.balance de forma atômica.
- Assinatura: a mudança de status deve refletir em subscriptions e, quando aplicável, em profiles.is_subscriber.
- Resultado de torneio: admin salva tournament_entries, calcula points_earned e atualiza profiles.elo_points e profiles.elo_tier.
- Ranking: profiles.elo_points é a referência principal; elo_tier deriva do total de pontos.

## Colunas Relevantes

- profiles.id sempre deve corresponder ao auth.users.id.
- wallets.user_id sempre deve corresponder ao auth.users.id.
- wallet_transactions.user_id sempre aponta para o dono da movimentação.
- wallet_transactions.balance_before e balance_after devem refletir a evolução real do saldo.
- subscriptions.user_id identifica a assinatura do jogador.
- events.status controla o ciclo upcoming, ongoing e finished; featured_* e is_featured servem para destacar o evento em cards e blocos editoriais.
- news.slug precisa ser unico e servir como chave editorial para referencias visuais e futuras rotas de detalhe.
- news.category controla a taxonomia editorial; published_at define a ordem de publicacao; is_active e is_featured determinam visibilidade.
- Manter apenas um `is_featured = true` ativo por vez no banco; `is_hot` continua sem restricao de unicidade.
- tournament_entries.event_id e user_id formam a ligação entre evento e jogador; final_position define a colocação e points_earned o impacto no Elo.
