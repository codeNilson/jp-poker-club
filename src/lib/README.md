# lib

Utilitários centrais do projeto.

Este diretório é para funções pequenas e genéricas, como helpers de classe CSS, formatação, normalização, validação compartilhada e contratos comuns.

Arquivos e pastas atuais:
- `utils.ts`: helper de classes CSS (`cn`) baseado em `clsx` e `tailwind-merge`.
- `env.ts`: leitura e validação das variáveis de ambiente usando Zod (server-only).
- `supabase/`: clientes Supabase tipados para browser (`client.ts`), servidor/SSR (`server.ts`) e admin (`admin.ts`).
