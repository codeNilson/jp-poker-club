# services

Integrações e chamadas externas.

Use esta pasta para comunicação com APIs, gateways, Supabase, autenticação, webhooks e qualquer acesso a dados fora da UI.

A ideia é manter a regra de negócio fora dos componentes e concentrar aqui a parte de infraestrutura e comunicação.

Arquivos atuais:
- `news.service.ts`: busca de notícias (feed paginado, destaque, artigo por slug, slugs publicados). Server-only.
- `radar.service.ts`: montagem do radar semanal combinando eventos próximos e notícias recentes. Server-only.
