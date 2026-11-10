---
name: rest-api-ts
description: Padrões de API REST em TypeScript com camadas route/controller/service/model, envelope de resposta único, ServiceResult em vez de exceções, validação com zod no middleware, paginação, mapa de código de erro para status HTTP e testes de contrato. Use sempre que a tarefa envolver criar ou alterar endpoint, rota, controller, service, model, schema de validação, middleware, código de erro, tratamento de erro ou teste numa API TypeScript/Express, mesmo que o pedido não use essas palavras — inclui frases como "cria um endpoint de X", "adiciona validação em Y", "esse endpoint está retornando erro", "preciso salvar isso no servidor", ou pedidos que chegam pelo lado do cliente e exigem mudança na API.
---

# API REST em TypeScript — padrões de camadas e contrato

Este é o conjunto de convenções para APIs REST em TypeScript onde o cliente
(app mobile, SPA) tem **um único parser de resposta**. Nesse arranjo, uma rota
que foge do formato não dá erro de compilação nem de teste: a chamada
"funciona" e o cliente mostra erro genérico. As regras abaixo existem para
tornar esse tipo de quebra impossível, não por estilo.

Se o projeto tiver um arquivo `references/project.md` ao lado deste, leia-o
também: é onde ficam as escolhas específicas do projeto (banco, provedor de
autenticação, caminhos, armadilhas já vividas).

## Camadas

O fluxo é sempre o mesmo:

```
routes -> controller -> service
routes -> controller -> service -> model   (quando o acesso a dados cresce)
```

```
src/
├── routes/        # caminho + middlewares. Zero lógica.
├── controllers/   # resultado do service -> HTTP. Zero regra de negócio.
├── services/      # regra de negócio. Nunca lança.
├── models/        # acesso a dados e mapeamento de linha -> tipo (opcional)
├── schemas/       # zod, um arquivo por payload, agrupado por domínio
├── middleware/    # auth, validate, rate limit, errorHandler, notFound
├── types/         # ServiceResult, envelope de resposta, códigos de erro
├── errors/        # mapa código -> status HTTP, mensagens padrão
├── constants/     # listas de colunas, valores fixos
└── utils/         # helpers puros
```

O teste que mantém as camadas honestas: **se você precisa do objeto
`response` dentro de um service, ou do cliente de banco dentro de um
controller, a lógica está na camada errada.**

### Como `schemas/` é organizado

Uma subpasta por domínio, com os mesmos nomes de `types/` — quem procura o
schema de cartão vai em `schemas/cards/` porque `types/cards/` existe. A pasta
já diz que o arquivo é um schema, então o nome dele não repete a palavra.

```
schemas/
├── fields/       # pedaços de campo reaproveitados (passwordField, amountField)
├── common/       # pagination, idParam
├── auth/         # login, refresh, changePassword, passwordResetRequest
├── users/        # updateProfile, spendingLimit
├── cards/        # card
├── purchases/    # purchase
├── salaries/     # salary
├── expenses/     # expense
└── statements/   # statement
```

`fields/` e `common/` são as únicas pastas que não são domínios: `fields/`
guarda os construtores de campo que os payloads compõem (`entryNameField`,
`amountField`, `usernameField`), e `common/` os schemas de query e params
usados por vários recursos. Extrair um campo vale a pena quando dois payloads
precisam do mesmo limite — é o que impede que eles divirjam sem ninguém notar.

### Quando criar a camada de model

O model não é obrigatório. Para um CRUD simples, o service falar direto com o
banco é mais claro do que atravessar uma camada que só repassa a chamada.

Crie o model quando aparecer um destes sinais:

- a mesma consulta é usada por mais de um service;
- o service começa a ter mais linhas de montagem de query do que de regra de
  negócio;
- o mapeamento de linha para tipo ficou complexo o bastante para ter casos.

Nesse ponto a camada passa a pagar o próprio custo: a regra de negócio volta a
caber na cabeça, e trocar o banco vira mudança local.

**Contrato do model:** ele não lança e não conhece `ServiceResult`. Devolve
`{ data, error }` no formato do driver, já com `data` mapeado para o tipo
próprio. Quem decide se aquele `error` é 404, 409 ou 500 é o service — assim
a tradução de erro continua num lugar só, e o model fica reaproveitável por
services com regras diferentes.

## Nomenclatura e comentários

**Identificadores em inglês** — funções, variáveis, tipos, arquivos.
**Comentários em português**, curtos e só quando fazem falta.

A divisão tem motivo: o vocabulário em volta já é inglês (`request`,
`response`, `next`, `data`, `error`), e misturar idiomas produz coisas como
`buscarUserById`. Comentário é outra coisa — é conversa entre pessoas do
time, e ali o português comunica melhor e mais rápido.

Comentário bom explica **por quê**, não **o quê**. O código já diz o quê:

```ts
// Ruim: repete o que a linha abaixo já mostra
// Incrementa o contador
attempts += 1

// Bom: explica a decisão, que o código não consegue mostrar
// Só tentativas que falharam contam, para não punir quem acerta a senha
attempts += 1
```

Quando o código precisa de um comentário para ser entendido, considere antes
renomear ou extrair — costuma resolver melhor que a explicação.

## Envelope de resposta

Todo endpoint responde a mesma forma — inclusive 404 de rota inexistente e
500 inesperado:

```ts
interface HttpResponse<T = unknown> {
  success: boolean
  message: string
  code?: string
  data?: T
  errors?: Array<{ field: string; message: string }>
}
```

```ts
{ success: true,  message: "Perfil atualizado com sucesso.", data: {...} }
{ success: false, message: "Usuário não encontrado.", code: "NOT_FOUND" }
{ success: false, message: "Erro de validação", code: "VALIDATION_ERROR", errors: [{ field, message }] }
```

- O `field` em `errors` não é decorativo: clientes usam ele para marcar o
  input correspondente na tela. Renomear um campo no schema muda onde a
  mensagem aparece para o usuário — é mudança de contrato, não refactor
  interno.
- **Toda resposta de falha leva o `code`.** É ele que o cliente usa para
  reagir a um erro específico — por exemplo, apagar a sessão local só quando
  a sessão foi revogada, e não quando a rede falhou. Mandar sempre evita que
  cada endpoint decida de um jeito. Trate os códigos como contrato: mudar um
  muda o comportamento do cliente.

### Listas e paginação

Listagem devolve os itens e a paginação dentro de `data`, sem campo novo no
envelope — o parser do cliente continua o mesmo:

```ts
{
  success: true,
  message: "Compras carregadas.",
  data: {
    items: [...],
    pagination: { page: 1, limit: 20, total: 134 }
  }
}
```

O schema de query de paginação mora em `schemas/common/pagination.ts` e é
reaproveitado por todo `GET` de lista, com **teto de `limit`**. Sem teto,
`?limit=100000` vira uma forma barata de derrubar o banco.

```ts
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
```

### Contrato de dados

- **Dinheiro em centavos inteiros** (`amountCents: 1990`), nunca `float`.
  `0.1 + 0.2` não dá `0.3`, e o erro aparece justamente na soma de um
  extrato.
- **Datas em ISO 8601 UTC** (`2026-11-09T22:45:00.000Z`) no contrato. Fuso é
  problema de exibição, resolvido no cliente.

## ServiceResult em vez de exceção

```ts
export type ServiceResult<T = void, E extends string = string> =
  | { status: true;  data: T }
  | { status: false; error: { code: E; message?: string } }
```

O motivo de não lançar: a tradução de erro para status HTTP acontece num
lugar só. Se cada service lançasse, todo `catch` teria que decidir de novo se
aquilo é 404, 409 ou 500 — e eles divergiriam. Com o resultado tipado, o
controller vira um tradutor de seis linhas e o compilador cobra os casos.

`message` é opcional porque a maioria dos erros tem uma mensagem padrão por
código. Quando o service não passa uma, o `sendFailure` usa a do mapa
`errorMessageMap` (em `errors/`), também tipado como `Record<ErrorCode,
string>` — então nenhum erro chega ao cliente com `message` vazio.

## Controller — sempre esta forma

```ts
async update(request: Request, response: Response): Promise<Response> {
  const result = await ProfileService.update(requireAuthField(request, "userId"), request.body)

  if (!result.status) return sendFailure(response, result.error, errorHttpStatusMap)

  return sendSuccess(response, "Perfil atualizado com sucesso.", result.data)
}
```

`sendFailure` e `sendSuccess` (em `utils/`, ver "Funções pequenas e sem
repetição") são a única forma de responder: controller não chama
`response.status().json()` direto.

- **`create` e `update` respondem só com o `id`**, não com o recurso inteiro.
  O cliente acabou de enviar os demais campos, então devolvê-los é tráfego
  sem uso — e no banco significa um `SELECT` de todas as colunas em vez de
  uma. As leituras (`GET`) é que trazem o recurso completo. `create` responde
  `201`.
- **`delete` responde `200` com o envelope** (`{ success: true, message }`),
  não `204`. Resposta sem corpo quebra o parser único do cliente, que espera
  sempre ler `success` e `message`.

### Dados da autenticação no controller

Campos que o middleware de auth pendura no `request` (id do usuário, da
sessão) são declarados opcionais, porque o tipo vale também para as rotas
públicas. **Leia esses campos sempre por um helper `requireAuthField`, nunca com
`!`**:

```ts
// utils/requireAuthField.ts
type AuthField = "userId" | "sessionId"

export function requireAuthField(request: Pick<Request, AuthField | "method" | "originalUrl">, field: AuthField): string {
  const value = request[field]
  if (!value) {
    throw new Error(`${field} ausente em ${request.method} ${request.originalUrl}: rota sem authMiddleware`)
  }
  return value
}

// no controller
const result = await PurchaseService.list(requireAuthField(request, "userId"), request.validated.query)
```

O `!` só cala o compilador. Se alguém montar a rota sem o middleware, `undefined`
chega ao service e vira filtro `user_id = undefined`, que falha de um jeito
confuso ou, pior, não filtra. O helper transforma esse erro de montagem num
erro claro no log, que o Express 5 leva ao `errorHandler` como 500: é bug do
servidor, não do cliente, então não é 401.

Dois detalhes do helper:

- `AuthField` lista só os campos que o middleware preenche, então um nome
  errado não compila. Campo novo no token entra nessa união e na declaração
  global do `Request`.
- O parâmetro usa `Pick<Request, ...>` em vez de `Request`, porque um
  controller tipado como `Request<unknown, unknown, Dto>` não é aceito onde se
  espera o `Request` padrão.

### Onde colocam-se os helpers de cada camada

Métodos de controller são passados soltos para o roteador
(`router.get(..., Controller.list)`), então **`this` é `undefined` dentro
deles**. A consequência prática importa: helper de controller vai para
`utils/`, nunca para método privado — o método privado compila normalmente e
quebra só em runtime, no primeiro request. Se precisar mesmo de `this`, a
rota tem que passar `Controller.metodo.bind(Controller)`.

Em service é o contrário: eles são sempre chamados como `Service.metodo()`,
então `this` funciona. Lógica que só aquele service usa pertence a um método
privado dele; o que serve a vários vira helper em `utils/`.

O objetivo dos dois lados é o mesmo: arquivos de controller e service com
imports e a classe, sem funções soltas no topo.

A regra vale também para declarações: **nada de `type`, `interface` ou
`const` no topo de controller ou service.** Cada coisa tem pasta própria:

| Declaração | Vai para |
|---|---|
| Alias de resultado (`AuthResult<T>`, `ProductResult<T>`) e tipos derivados | `types/<domínio>/index.ts` |
| Tipo da linha do banco (`ProductRow`) | `types/<domínio>/row.ts`, ou dentro do model quando ele existe |
| Valores fixos e listas (`STOCK_COUNT_KEYS`) | `constants/<domínio>.ts` |
| Erros e mensagens reaproveitados (`NOT_FOUND_ERROR`, `INVALID_CREDENTIALS_MESSAGE`) | `errors/<domínio>.ts`, ao lado do mapa de status |

O motivo é o mesmo das funções soltas: declaração no topo do service é
invisível para os outros arquivos e acaba copiada no próximo service do
mesmo domínio, e as cópias divergem. O sinal de que isso já aconteceu é
achar o mesmo `type XResult<T>` ou a mesma mensagem de erro em dois
services.

## Service — sempre esta forma

```ts
async getById(userId: string, id: string): Promise<ServiceResult<Card, CardErrorCode>> {
  try {
    const { data, error } = await db.from("cards").select(CARD_COLUMNS).eq("user_id", userId).eq("id", id).maybeSingle()

    if (error) {
      console.error("[CardService.getById]", error)
      return { status: false, error: { code: CardErrorCode.FETCH_FAILED } }
    }

    if (!data) return { status: false, error: { code: CardErrorCode.NOT_FOUND } }

    return { status: true, data: mapCard(data) }
  } catch (error) {
    console.error("[CardService.getById] error:", error)
    return { status: false, error: { code: CardErrorCode.FETCH_FAILED, message: "Erro ao carregar o cartão." } }
  }
}
```

Pontos que importam:

- **O log recebe o erro cru; a resposta leva mensagem genérica.** Detalhe de
  banco no log do servidor, nunca na tela — mensagem de erro de driver
  costuma revelar nome de tabela, coluna e às vezes o próprio dado.
- **Desfecho esperado não é `console.error`.** Nome já em uso, registro não
  encontrado, credencial errada: são respostas normais da API (409, 404,
  401), não falhas. Registrá-los como erro faz o uso corriqueiro do app
  poluir o log e, em produção, disparar alerta à toa. Trate esses casos
  separados da linha de log, como o `!data` acima.
- **Nunca logar token, senha ou credencial.** É o vazamento mais fácil de
  cometer sem perceber, e o mais difícil de auditar depois.
- **Sempre mapear a linha do banco para um tipo próprio** antes de devolver.
  Retornar a linha crua vaza colunas internas para o cliente na primeira vez
  que alguém adicionar um campo na tabela.

### Operações que gravam em mais de uma tabela

Dois `insert` seguidos não são atômicos: se o segundo falhar, o primeiro fica
gravado e o dado fica inconsistente (uma compra sem suas parcelas, por
exemplo). Quando a operação precisa ser tudo-ou-nada, ela vira **uma função
no banco chamada numa única ida** (no Supabase/Postgres, uma função SQL via
`rpc`), criada por migration. O service continua igual: chama, confere o
`error`, devolve `ServiceResult`.

## Funções pequenas e sem repetição

Quando um método faz mais de uma coisa — valida, transforma, consulta e
formata — extraia as partes. O sinal prático: **se você precisou de um
comentário para separar "seções" dentro da função, cada seção provavelmente é
uma função.** Nomeie a extração pelo que ela decide, não pelo passo do
processo (`mapPasswordUpdateError` diz mais que `step2`).

Isso não é estética. Função que faz uma coisa só é a que dá para testar
isoladamente, reaproveitar e ler sem rolar a tela.

Nesta arquitetura a duplicação aparece quase sempre nos mesmos quatro lugares —
vale extrair já na segunda ocorrência:

- **o bloco de erro do controller** (traduzir código para status e montar o
  corpo). Extraia um `sendFailure(response, error, statusMap)` genérico no
  código de erro, recebendo o mapa por parâmetro — assim ele serve a todos os
  recursos, e o genérico amarra enum e mapa: passar o mapa de outro domínio
  não compila. Ele sempre coloca o `code` no corpo e cai na mensagem padrão
  do código quando o service não mandou uma;
- **o bloco de sucesso do controller**. Extraia um
  `sendSuccess(response, message, data?, status = 200)` que monta o envelope
  com `success: true`, tipado como `HttpResponse<T>`. Com ele nenhum
  controller monta o corpo à mão, e um campo esquecido ou com nome errado
  (`sucess`, `msg`) deixa de ser possível — é exatamente o tipo de quebra que
  o parser único do cliente não perdoa. Status diferente de 200 vai no último
  parâmetro (`201` no `create`);
- **o mapeamento de linha do banco para tipo**, repetido entre `get` e
  `update` do mesmo recurso;
- **listas de colunas de `SELECT`**, que devem morar em `constants/`, senão
  divergem entre as consultas do mesmo recurso.

Duplicação que ainda não se repetiu não é duplicação: duas coisas parecidas
que mudam por razões diferentes devem continuar separadas. Abstrair cedo
demais custa mais caro que copiar uma vez.

## Rota

```ts
router.post("/login", loginRateLimiter, validate({ body: LoginSchema }), AuthController.login)
router.put("/profile", authMiddleware, validate({ body: UpdateProfileSchema }), ProfileController.update)
router.get("/purchases", authMiddleware, validate({ query: PaginationQuerySchema }), PurchaseController.list)
```

Ordem dos middlewares: **rate limit → auth → validate → controller**. Da
verificação mais barata para a mais cara — não faz sentido validar o corpo de
uma requisição que será recusada por falta de token.

Rotas de autenticação precisam de rate limiter. Prefira contar apenas as
tentativas que falham (no `express-rate-limit`,
`skipSuccessfulRequests: true`), para não punir quem acerta a senha.

## Validação com zod

**Todo dado vindo do cliente passa por um schema zod** — corpo, query e
params — antes de chegar ao controller. Sem exceção. Endpoint que confia no
formato enviado pelo cliente é por onde entra dado malformado, e depois
payload construído de propósito.

A validação mora num middleware `validate({ body?, query?, params? })`, nunca
dentro do controller. Ele responde **422** com a lista de `errors` no formato
do envelope e só chama `next()` com os dados já convertidos.

```ts
// schemas/cards/card.ts
export const CreateCardSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do cartão.").max(60, "Nome muito longo."),
})

export type CreateCardDTO = z.infer<typeof CreateCardSchema>
```

Detalhes que fazem diferença:

- **Mensagens em português**, porque elas chegam ao usuário final pelo campo
  `errors[].message`.
- **O tipo sai do schema com `z.infer`**, nunca declarado à mão em paralelo.
  Assim o schema é a única fonte da verdade e não existe o caso de o tipo
  dizer uma coisa e a validação aceitar outra.
- **Normalize na validação** (`trim`, `toLowerCase`), não no controller — o
  resto do código recebe o dado já limpo.
- **Onde o dado validado fica.** No Express 5, `request.query` é um getter
  somente leitura: `request.query = parsed` não tem efeito, e o controller
  acaba lendo a string crua achando que é número. Por isso o `validate`
  grava o resultado em `request.validated` (`{ body, query, params }`,
  declarado na tipagem global do `Request`) e o controller lê **sempre** de
  lá, nunca de `request.query` ou `request.params`.
- **Use `z.coerce` em query e params**: chegam sempre como string, então
  `?page=2` só vira número com coerção.

Manter isso fora do controller é o que garante que toda rota falhe da mesma
maneira, e o cliente só precisa entender um formato de erro de validação.

## Erros fora dos controllers: `notFound` e `errorHandler`

Dois middlewares no fim da cadeia, nesta ordem, depois de todas as rotas:

- **`notFound`** responde `404` no envelope
  (`{ success: false, message: "Rota não encontrada.", code: "ROUTE_NOT_FOUND" }`).
  Sem ele o Express devolve HTML, e o parser do cliente quebra.
- **`errorHandler`** (assinatura com quatro parâmetros) pega tudo o que foi
  lançado — inclusive o `requireAuthField` e JSON malformado no corpo —,
  loga o erro cru e responde `500` no envelope com mensagem genérica e
  `code: "INTERNAL_ERROR"`. **Nunca devolve stack nem `error.message`.** O
  caso especial é corpo maior que o limite ou JSON inválido
  (`error.type === "entity.too.large"` / `"entity.parse.failed"`), que vira
  `413` / `400`, porque aí o erro é do cliente.

## Códigos de erro

Todo erro novo entra em três lugares:

1. O enum de códigos (`ErrorCode`)
2. O mapa de status HTTP
3. O mapa de mensagens padrão

```ts
export const errorHttpStatusMap: Record<ErrorCode, number> = {
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  // ...
}

export const errorMessageMap: Record<ErrorCode, string> = {
  [ErrorCode.NOT_FOUND]: "Registro não encontrado.",
  [ErrorCode.INVALID_CREDENTIALS]: "Usuário ou senha incorretos.",
  // ...
}
```

Tipar os mapas como `Record<ErrorCode, ...>` é intencional: adicionar um
código sem definir status e mensagem **quebra a compilação**, em vez de virar
um 400 silencioso ou uma mensagem vazia em produção.

## Acesso ao banco

Use sempre o cliente de **menor privilégio** que resolve a tarefa. Projetos
costumam ter um cliente administrativo que ignora as regras de acesso por
linha e um cliente de usuário que as respeita. Ler dado de usuário com o
cliente administrativo funciona, passa nos testes e desliga silenciosamente a
proteção — a partir daí, um bug de filtro vira vazamento entre contas.

Ao mexer numa lista de colunas de `SELECT`, confira contra as migrations. A
maioria dos bancos rejeita a **query inteira** quando uma coluna não existe,
então um campo errado não derruba um campo: derruba o endpoint.

**Nunca decida de quem é o dado por um id vindo do cliente.** O dono sai do
token autenticado; o id do corpo ou da URL serve no máximo para dizer *qual*
registro, e ainda assim filtrado pelo dono. É a diferença entre um endpoint
correto e um que entrega a conta de outra pessoa para quem trocar um número
na requisição.

## Desempenho

Antes de otimizar, meça — mas estes quatro erros são caros e fáceis de evitar
desde o início:

- **Chamadas independentes vão em paralelo** (`Promise.all`). `await`
  encadeado soma latências que poderiam correr juntas; num endpoint que faz
  três consultas, isso é a diferença entre 90ms e 270ms.
- **Filtre, ordene e pagine no banco**, não em JavaScript. Trazer mil linhas
  para descartar novecentas gasta rede, memória e tempo de serialização.
- **Selecione só as colunas que usa.** Além de mais leve, evita vazar coluna
  nova sem querer.
- **Cuidado com N+1**: consulta dentro de laço vira N consultas. Busque em
  lote e junte na memória.

## Testes

O foco é o que quebra o cliente sem quebrar a compilação:

- **Service testado isolado**, com o banco (ou o model) simulado, conferindo
  o `ServiceResult` de cada caminho: sucesso, não encontrado, conflito,
  falha do banco. O tipo de retorno já diz quais casos existem — cada `code`
  possível merece um teste.
- **Teste de contrato das rotas** (com `supertest`): para cada rota, uma
  chamada de sucesso e uma de falha conferindo que o corpo tem `success` e
  `message`, que falhas trazem `code`, e que validação devolve `422` com
  `errors[].field`. É esse teste que pega a rota que "funciona" mas foge do
  envelope.
- **Teste de isolamento entre contas** nos recursos com dono: o usuário A
  pedindo o id de um registro do usuário B recebe `404`, não o registro.

## Passo a passo para um endpoint novo

1. Migration, se envolver coluna, tabela ou função de banco nova
2. Schema zod em `schemas/<domínio>/`, com o DTO saindo de `z.infer`
3. Acesso a dados: no service mesmo, ou no model se algum dos sinais acima
   aparecer
4. Método no service, devolvendo `ServiceResult`
5. Código novo no enum + mapa de status + mapa de mensagens, se houver erro novo
6. Método no controller, na forma acima
7. Rota, com os middlewares na ordem certa
8. Testes do service e de contrato da rota
9. Checagem de tipos antes de encerrar
10. Do lado do cliente: a função correspondente e a constante da rota

## Higiene de configuração

- Valide as variáveis de ambiente na subida (com um schema zod) e **falhe
  cedo** se faltar algo — descobrir chave ausente no primeiro request de
  produção é caro.
- Desligue parsers que você não usa. `express.urlencoded`, por exemplo, é
  superfície de prototype pollution numa API que só fala JSON.
- Limite o tamanho do corpo (`express.json({ limit: "10kb" })`).
- Use `helmet()` para os cabeçalhos de segurança e
  `app.disable("x-powered-by")` — anunciar que é Express só ajuda quem está
  procurando vulnerabilidade conhecida.
- CORS por allowlist. Requisições sem `Origin` (apps nativos) passam; clientes
  web precisam entrar na lista explicitamente.