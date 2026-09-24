# Engine do Cita.sh — Referência da API

A engine é o núcleo do Cita.sh: detecta o tipo de entrada, busca metadados em APIs públicas, formata a referência em ABNT NBR 6023:2018 e exporta para BibTeX e RIS.

Ela é escrita em TypeScript, não depende de React e é importada de um único ponto:

```ts
import { detectInput, resolveFromDOI, formatReference } from './engine';
```

**Nesta página:** [Início rápido](#início-rápido) · [Detecção de entrada](#detecção-de-entrada) · [Resolvers](#resolvers) · [Formatação](#formatação) · [Autores](#autores) · [Exportadores](#exportadores) · [Tipos](#tipos) · [Erros](#erros)

---

## Início rápido

Do DOI à referência formatada:

```ts
import { detectInput, resolveFromDOI, formatReference } from './engine';

const entrada = detectInput('https://doi.org/10.1145/3368089.3409766');
// entrada.type       → 'doi'
// entrada.normalized → '10.1145/3368089.3409766'

const metadados = await resolveFromDOI(entrada.normalized);
const referencia = formatReference(metadados);

console.log(referencia.plain);    // texto pronto para colar
console.log(referencia.abntHtml); // mesmo texto, com <em> no destaque
```

O fluxo é sempre o mesmo: **detectar → resolver → formatar**. Para livros, troque `resolveFromDOI` por `resolveFromISBN`. Para entradas sem DOI ou ISBN, monte os metadados manualmente e chame `formatReference` direto.

---

## Detecção de entrada

### `detectInput(input)`

```ts
detectInput(input: string): DetectedInput
```

Identifica se o texto é um DOI, ISBN, URL ou entrada manual, e devolve o valor normalizado para os resolvers.

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `input` | `string` | Texto digitado pelo usuário. Espaços nas pontas são ignorados. |

**Retorna** um [`DetectedInput`](#detectedinput).

A detecção segue esta ordem, e o primeiro que casar vence:

| Ordem | Tipo | Aceita | `normalized` |
|---|---|---|---|
| 1 | `doi` | `10.xxxx/...`, `doi:10.xxxx/...`, `https://doi.org/...`, `https://dx.doi.org/...` | Só o DOI, sem prefixo |
| 2 | `isbn` | 10 ou 13 dígitos, com ou sem hífens ou espaços, com ou sem `ISBN:` | Só os dígitos |
| 3 | `url` | Qualquer texto começando com `http://` ou `https://` | Igual à entrada |
| 4 | `manual` | Qualquer outra coisa | Igual à entrada |

Como o DOI é testado primeiro, um link `https://doi.org/...` é tratado como DOI, não como URL.

```ts
detectInput('978-3-16-148410-0');
// → { type: 'isbn', value: '978-3-16-148410-0', normalized: '9783161484100' }
```

### `INPUT_TYPE_LABELS`

```ts
INPUT_TYPE_LABELS: Record<string, string>
```

Rótulos em português para exibir o tipo detectado na interface: `'DOI detectado'`, `'ISBN detectado'`, `'URL detectada'` e `'Entrada manual'`.

---

## Resolvers

Os resolvers fazem requisições HTTP para APIs públicas e convertem a resposta nos [tipos de metadados](#tipos) da engine. Nenhum exige chave de API.

### `resolveFromDOI(doi)`

```ts
resolveFromDOI(doi: string): Promise<ArticleMetadata | BookMetadata>
```

Busca os metadados de uma publicação na [API REST do CrossRef](https://api.crossref.org/works).

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `doi` | `string` | DOI **normalizado**, sem `https://doi.org/`. Use `detectInput(...).normalized`. |

**Retorna** um `BookMetadata` quando o CrossRef classifica a obra como `book` ou `monograph`. Em qualquer outro caso, retorna um `ArticleMetadata`.

**Como os campos são preenchidos:**

| Campo da engine | Origem no CrossRef |
|---|---|
| `authors` | `author[]`. Quando o autor tem só `name`, vira autor institucional. |
| `title`, `subtitle` | Primeiro item de `title[]` e `subtitle[]` |
| `year` | Data de publicação |
| `journal` | Primeiro item de `container-title[]` |
| `volume`, `issue`, `pages` | `volume`, `issue`, `page` |
| `publisher`, `location` | `publisher`, `publisher-location` (livros) |

**Erros:** veja [Erros](#erros).

### `resolveFromISBN(isbn)`

```ts
resolveFromISBN(isbn: string): Promise<BookMetadata>
```

Busca os metadados de um livro na [Open Library](https://openlibrary.org/developers/api).

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `isbn` | `string` | ISBN **normalizado**, só dígitos. Use `detectInput(...).normalized`. |

**Retorna** um `BookMetadata` com título, subtítulo, ano, editora, local, número de páginas e autores.

> **Atenção:** a Open Library devolve os autores como referências, e cada nome exige uma requisição extra. A engine busca no máximo 5 autores e **ignora silenciosamente** os que falharem. A referência pode sair sem autores; valide o campo `authors` antes de exibir.

---

## Formatação

### `formatReference(metadata)`

```ts
formatReference(metadata: ReferenceMetadata): FormattedReference
```

Formata uma referência em ABNT NBR 6023:2018, escolhendo o formatador pelo campo `metadata.type`.

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `metadata` | [`ReferenceMetadata`](#referencemetadata) | Metadados vindos de um resolver ou montados manualmente |

**Retorna** um [`FormattedReference`](#formattedreference) com o texto formatado, a versão HTML, os metadados originais e um `id` único.

**Lança** `Error` se `metadata.type` não for um dos cinco tipos suportados.

**Exemplo com entrada manual:**

```ts
const ref = formatReference({
  type: 'thesis',
  authors: [{ fullName: 'Samara Silvia Sabino' }],
  title: 'Diretrizes para implementação de microfrontends em larga escala',
  year: '2027',
  thesisType: 'dissertacao',
  program: 'Ciência da Computação',
  institution: 'Universidade Federal de Pernambuco',
  city: 'Recife',
});
```

**Regras aplicadas em todos os tipos:**

- Até 3 autores são listados, separados por `;`. Com 4 ou mais, aparece o primeiro seguido de `et al.`
- O destaque (título do periódico ou do livro) é marcado com `<em>` no HTML.
- Se `url` estiver preenchido, a referência termina com `Disponível em: {url}.` e, havendo `accessDate`, `Acesso em: {accessDate}.`

### `sortReferences(refs)`

```ts
sortReferences(refs: FormattedReference[]): FormattedReference[]
```

Devolve uma **nova** lista em ordem alfabética pelo texto formatado, como a ABNT exige na lista de referências. A comparação usa o locale `pt-BR` e ignora acentos e caixa. A lista original não é alterada.

---

## Autores

### `formatAuthor(author)`

```ts
formatAuthor(author: Author): string
```

Formata um único autor no padrão ABNT.

| Entrada | Saída | Regra |
|---|---|---|
| `{ fullName: 'João Almeida da Silva' }` | `SILVA, J. A. da` | Sobrenome em caixa alta, prenomes abreviados, partícula no fim |
| `{ fullName: 'IBGE', institutional: true }` | `IBGE` | Autor institucional inteiro em caixa alta |
| `{ fullName: 'Heitor Villa-Lobos' }` | `VILLA-LOBOS, H.` | Sobrenome composto conhecido tratado como unidade |

Partículas reconhecidas: `da`, `das`, `de`, `do`, `dos`, `e`, `del`, `della`, `di`, `du`, `van`, `von`, `der`, `den`, `la`, `le`, `les`.

### `formatAuthors(authors)`

```ts
formatAuthors(authors: Author[]): string
```

Formata a lista completa: até 3 autores separados por `; `, ou o primeiro seguido de `et al.` a partir de 4. Retorna string vazia para lista vazia.

### `parseAuthors(input)`

```ts
parseAuthors(input: string): Author[]
```

Converte texto livre em uma lista de `Author`, para uso no formulário manual. Separa por `;` quando houver; caso contrário, separa por vírgula seguida de letra maiúscula.

```ts
parseAuthors('Maria Santos; João da Silva');
// → [{ fullName: 'Maria Santos' }, { fullName: 'João da Silva' }]
```

---

## Exportadores

Convertem referências formatadas para os dois formatos que gerenciadores como Zotero, Mendeley e o LaTeX importam.

| Função | Assinatura | Retorna |
|---|---|---|
| `toBibTeX` | `(ref: FormattedReference) => string` | Uma entrada BibTeX |
| `toBibTeXFile` | `(refs: FormattedReference[]) => string` | Conteúdo completo de um arquivo `.bib` |
| `toRIS` | `(ref: FormattedReference) => string` | Uma entrada RIS |
| `toRISFile` | `(refs: FormattedReference[]) => string` | Conteúdo completo de um arquivo `.ris` |

As funções devolvem texto. Gravar o arquivo ou disparar o download fica a cargo de quem chama.

---

## Tipos

### `ReferenceMetadata`

União dos cinco tipos de metadados. O campo `type` determina qual formatador é usado.

```ts
type ReferenceMetadata =
  | ArticleMetadata   // type: 'article'
  | BookMetadata      // type: 'book'
  | ChapterMetadata   // type: 'chapter'
  | WebsiteMetadata   // type: 'website'
  | ThesisMetadata;   // type: 'thesis'
```

**Campos comuns a todos (`BaseMetadata`):**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `type` | `ReferenceType` | sim | `'article'`, `'book'`, `'chapter'`, `'website'` ou `'thesis'` |
| `authors` | `Author[]` | sim | Pode ser vazio |
| `title` | `string` | sim | Título da obra |
| `subtitle` | `string` | não | Entra após o título, separado por `:` |
| `year` | `string` | sim | Ano de publicação |
| `url` | `string` | não | Gera o trecho "Disponível em" |
| `accessDate` | `string` | não | Formato `DD mês. AAAA`, ex.: `12 set. 2026` |
| `doi` | `string` | não | Guardado para referência; não entra no texto formatado |

**Campos específicos:**

| Tipo | Obrigatórios | Opcionais |
|---|---|---|
| `ArticleMetadata` | `journal` | `volume`, `issue`, `pages`, `issn` |
| `BookMetadata` | — | `edition`, `location`, `publisher`, `totalPages`, `isbn` |
| `ChapterMetadata` | `bookTitle`, `bookAuthors` | `bookSubtitle`, `bookAuthorRole` (`org.`, `ed.`, `coord.`), `edition`, `location`, `publisher`, `pages` |
| `WebsiteMetadata` | — | `siteName`, `publishDate` |
| `ThesisMetadata` | `thesisType` (`'tcc'`, `'dissertacao'`, `'tese'`), `program`, `institution`, `city` | `totalPages` |

### `Author`

| Campo | Tipo | Descrição |
|---|---|---|
| `fullName` | `string` | Nome completo da pessoa ou nome da instituição |
| `institutional` | `boolean` | Opcional. Se `true`, o nome sai inteiro em caixa alta, sem inversão |

### `FormattedReference`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string` | Identificador único gerado na formatação |
| `plain` | `string` | Texto da referência, sem marcação de destaque |
| `abnt` | `string` | Hoje é idêntico a `plain` (veja a nota abaixo) |
| `abntHtml` | `string` | Texto com o destaque em `<em>` e caracteres HTML escapados |
| `metadata` | `ReferenceMetadata` | Metadados usados na formatação |
| `createdAt` | `number` | Timestamp em milissegundos |

> **Nota:** o comentário em `types.ts` descreve `abnt` como "com marcações de itálico", mas `formatReference` atribui a ele o mesmo valor de `plain`. Para exibir o destaque, use `abntHtml`.

### `DetectedInput`

| Campo | Tipo | Descrição |
|---|---|---|
| `type` | `InputType` | `'doi'`, `'isbn'`, `'url'` ou `'manual'` |
| `value` | `string` | Entrada original, sem espaços nas pontas |
| `normalized` | `string` | Valor pronto para o resolver |

---

## Erros

Todas as funções lançam `Error` comum, com mensagem em português pronta para exibir ao usuário.

| Função | Mensagem | Causa | O que fazer |
|---|---|---|---|
| `resolveFromDOI` | `DOI não encontrado: {doi}` | O CrossRef respondeu 404 | Conferir o DOI ou usar entrada manual |
| `resolveFromDOI` | `Erro ao consultar CrossRef: {status}` | Qualquer outra resposta de erro | Tentar de novo; persistindo, usar entrada manual |
| `resolveFromISBN` | `ISBN não encontrado: {isbn}` | A Open Library respondeu 404 | Tentar o ISBN da outra edição ou usar entrada manual |
| `resolveFromISBN` | `Erro ao consultar Open Library: {status}` | Qualquer outra resposta de erro | Tentar de novo |
| `formatReference` | `Tipo de referência não suportado: {type}` | `metadata.type` inválido | Corrigir o objeto de metadados |

Falhas de rede (sem conexão, CORS) chegam como o erro nativo do `fetch`, sem a mensagem em português.

**Padrão de uso recomendado:**

```ts
try {
  const metadados = await resolveFromDOI(entrada.normalized);
  return formatReference(metadados);
} catch (erro) {
  const mensagem = erro instanceof Error ? erro.message : 'Erro ao resolver referência';
  mostrarErro(mensagem);
  abrirFormularioManual();
}
```
