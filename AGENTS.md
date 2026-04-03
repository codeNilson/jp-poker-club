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

## Supabase

- Não editar manualmente src/types/database.ts; arquivo gerado automaticamente.
- Após criar ou alterar tabelas no Supabase, regenerar src/types/database.ts.
- Usar src/lib/supabase/client.ts no browser.
- Usar src/lib/supabase/server.ts no server/SSR com cookies em getAll/setAll.
- Usar src/lib/supabase/admin.ts somente no servidor para operações administrativas.
