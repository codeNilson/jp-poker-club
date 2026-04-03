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

## Supabase

- Não editar manualmente src/types/database.ts; arquivo gerado automaticamente.
- Após criar ou alterar tabelas no Supabase, regenerar src/types/database.ts.
- O schema do Supabase deve ser tratado como código e versionado em supabase/migrations.
- Usar src/lib/supabase/client.ts no browser.
- Usar src/lib/supabase/server.ts no server/SSR com cookies em getAll/setAll.
- Usar src/lib/supabase/admin.ts somente no servidor para operações administrativas.
