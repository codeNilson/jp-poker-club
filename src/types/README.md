# types

Tipos e contratos TypeScript compartilhados.

Aqui entram interfaces, aliases, enums e tipos de domínio usados em vários pontos do projeto.

Se um tipo começar a ser usado por múltiplas camadas, coloque-o aqui para evitar duplicação e inconsistências.

Arquivos atuais:
- `database.ts`: tipos gerados automaticamente a partir do schema do Supabase. **Não edite manualmente.** Regenere com `npx supabase gen types typescript`.
