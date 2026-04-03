<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Regras

- Só mexa no arquivo readme.md se for solicitado.

## Tema

- Tema padrão sempre escuro, sem toggle light/dark.
- Usar como base visual: --primary #32e035, --background #070707, --card e --muted #0F0F13.

## UI e Layout

- UI do JP Poker Club usa cantos arredondados.
- Preferir componentes de src/components/ui antes de criar novos.
- Sempre considerar o layout mobile primeiro.

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
- Qualquer alteração no Agents.md deve ser informado ao usuário antes para confirmar se aceita.

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
- events representa torneios/eventos; cada evento tem status, buy_in, data e limite de jogadores.
- tournament_entries registra o resultado de cada jogador em cada evento; final_position e points_earned são a base para o ranking de Elo.

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
- events.status controla o ciclo upcoming, ongoing e finished.
- tournament_entries.event_id e user_id formam a ligação entre evento e jogador; final_position define a colocação e points_earned o impacto no Elo.
