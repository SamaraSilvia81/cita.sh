# Cita.sh

![TIPO](https://img.shields.io/static/v1?label=TIPO&message=Utility%20Tool&color=231f20&style=for-the-badge)
![STATUS](https://img.shields.io/static/v1?label=STATUS&message=Em%20Desenvolvimento&color=f59e0b&style=for-the-badge)
![PADRÃO](https://img.shields.io/static/v1?label=PADR%C3%83O&message=ABNT%20NBR%206023%3A2018&color=7c3aed&style=for-the-badge)
![STACK](https://img.shields.io/static/v1?label=STACK&message=React%20%2B%20TypeScript&color=3178c6&style=for-the-badge)
![BACKEND](https://img.shields.io/static/v1?label=BACKEND&message=Nenhum&color=6b7280&style=for-the-badge)

Formatador de referências bibliográficas no padrão **ABNT NBR 6023:2018**.

Você cola um DOI ou ISBN, o Cita.sh busca os metadados reais da publicação e devolve a referência formatada. Nada é gerado por IA: os dados vêm do CrossRef e da Open Library, e a formatação segue regras fixas. A mesma entrada sempre produz a mesma saída.

---

## O que ele faz

- **Detecta o tipo de entrada automaticamente:** DOI (com ou sem `https://doi.org/`), ISBN-10, ISBN-13 ou URL.
- **Busca metadados reais:** artigos via [CrossRef](https://www.crossref.org/documentation/retrieve-metadata/rest-api/) e livros via [Open Library](https://openlibrary.org/developers/api).
- **Entrada manual** para o que não tem DOI ou ISBN: sites, capítulos, TCCs, dissertações e teses.
- **Mantém uma lista** de referências em ordem alfabética, salva no navegador.
- **Exporta** a lista como texto, BibTeX (`.bib`) ou RIS (`.ris`).

## Tipos de referência suportados

| Tipo | Como entra | Exemplo de saída |
|---|---|---|
| Artigo de periódico | DOI ou manual | SILVA, J. A. et al. Título do artigo. *Nome do Periódico*, v. 10, n. 2, p. 15-28, 2023. |
| Livro | ISBN, DOI ou manual | SILVA, J. A. *Título do livro*. 2. ed. São Paulo: Editora, 2023. |
| Capítulo de livro | Manual | SILVA, J. A. Título do capítulo. In: SOUZA, M. B. (org.). *Título do livro*. São Paulo: Editora, 2023. p. 45-67. |
| Site | Manual | TÍTULO da página. Nome do site, 2023. Disponível em: URL. Acesso em: data. |
| TCC, dissertação ou tese | Manual | SILVA, J. A. *Título*. 2023. 120 f. Dissertação (Mestrado em Computação) – Universidade Federal de Pernambuco, Recife, 2023. |

O destaque tipográfico usado é o *itálico*, permitido pela NBR 6023:2018 desde que aplicado de forma consistente.

---

## Como funciona

```
entrada do usuário
      │
      ▼
detectInput()  ──►  doi / isbn / url / manual
      │
      ├── doi   ──►  resolveFromDOI()   ──►  CrossRef
      ├── isbn  ──►  resolveFromISBN()  ──►  Open Library
      └── url / manual  ──►  formulário manual
      │
      ▼
formatReference()  ──►  texto ABNT + HTML
      │
      ▼
lista (localStorage)  ──►  copiar / .bib / .ris
```

Toda a lógica de formatação fica em `src/engine/`, separada da interface. A engine não depende de React e pode ser usada em qualquer projeto TypeScript. A documentação completa dela está em **[docs/engine-api.md](docs/engine-api.md)**.

---

## Rodando localmente

**Pré-requisito:** Node.js 20 ou superior.

```bash
git clone https://github.com/SamaraSilvia81/cita.sh.git
cd cita.sh
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`. Não há backend nem variáveis de ambiente: todas as chamadas vão direto do navegador para as APIs públicas.

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Checagem de tipos (`tsc`) e build de produção |
| `npm run lint` | Lint com Oxlint |
| `npm run preview` | Serve o build localmente |

---

## Estrutura

```
src/
├── engine/                 # Lógica de domínio, sem dependência de React
│   ├── index.ts            # Interface pública da engine
│   ├── types.ts            # Tipos de metadados e resultado
│   ├── formatter.ts        # formatReference() e sortReferences()
│   ├── formatters/         # Um formatador por tipo (article, book, chapter, website, thesis)
│   ├── resolvers/          # crossref.ts (DOI) e openlibrary.ts (ISBN)
│   ├── exporters/          # bibtex.ts e ris.ts
│   └── utils/              # detect-input.ts e authors.ts
├── hooks/                  # useResolver, useReferences, useRoute
├── components/             # Interface: InputArea, ManualForm, ResultCard, ReferenceList
└── styles/global.css
```

**Stack:** React 19, TypeScript, Vite. Sem biblioteca de UI e sem dependências de runtime além do React.

---

## Limitações conhecidas

- **URLs ainda não são resolvidas.** Links são detectados, mas o usuário é direcionado para a entrada manual. A leitura de metadados de páginas depende de um proxy por causa de CORS e está no [backlog](BACKLOG.md).
- **DOIs que não são livro viram artigo.** Tudo o que o CrossRef não classifica como `book` ou `monograph` é tratado como artigo de periódico, incluindo trabalhos de evento.
- **Autores do ISBN podem vir incompletos.** A Open Library exige uma requisição por autor. O Cita.sh busca até 5 e ignora os que falharem, então confira os autores antes de usar a referência.
- **A lista guarda até 20 referências.** Ao atingir o limite, novas referências não são adicionadas.

## Roadmap

As próximas funcionalidades estão em [BACKLOG.md](BACKLOG.md).

## Licença

A definir.
