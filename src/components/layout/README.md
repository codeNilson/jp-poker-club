# layout

Componentes de composição visual.

Use esta pasta para peças que organizam a estrutura geral da tela, como topo da aplicação, navegação, rodapé, containers principais e variações de shell.

Esses componentes normalmente juntam vários blocos de `ui` para formar a moldura da interface.

Componentes atuais:
- `Navbar.tsx`: barra de navegação principal com autenticação, menu desktop e mobile, e hide-on-scroll para mobile.
- `footer.tsx`: rodapé global da aplicação.
- `global-background.tsx`: fundo visual global aplicado no layout raiz.
- `home-carousel.tsx`: carrossel de destaque da página inicial, consumindo `carousel_items` do Supabase.
