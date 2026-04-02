# hooks

Hooks compartilhados do React.

Use esta pasta para funções que começam com `use` e encapsulam comportamento reutilizável, como estado, efeitos, acesso a `localStorage`, debounce, permissões ou dados derivados.

Se o hook passar a depender de API, autenticação ou domínio, considere separar a integração em `services` e deixar o hook como camada de consumo.
