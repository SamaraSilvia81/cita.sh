# Formatador ABNT — Backlog do MVP

## Visão do produto

Ferramenta web que formata referências bibliográficas no padrão ABNT NBR 6023:2018
de forma determinística e precisa. Resolve metadados reais via APIs (CrossRef, Open Library)
e nunca inventa dados. Client-side puro, sem backend.

**Posicionamento:** "Nunca mais erre uma referência."

**Diferencial vs. IA:** precisão determinística, dados reais via API,
batch processing, exportação estruturada (BibTeX/RIS).

---

## Stack

- React 19 + Vite + TypeScript
- Zero dependências externas pesadas (sem UI library)
- CSS Modules ou vanilla CSS
- localStorage para persistência de sessão
- Vercel (deploy)

---

## Funcionalidades — MVP

### F1. Input inteligente
- [ ] Campo único de input com detecção automática de tipo
  - DOI (regex: `10.\d{4,9}/...`)
  - ISBN (10 ou 13 dígitos)
  - URL (http/https)
  - Texto livre → redireciona pra entrada manual
- [ ] Feedback visual do tipo detectado (badge: "DOI detectado", etc.)
- [ ] Botão "Formatar"

### F2. Resolução de metadados via API
- [ ] CrossRef API (`api.crossref.org/works/{doi}`) → artigos
- [ ] Open Library API (`openlibrary.org/isbn/{isbn}.json`) → livros
- [ ] Meta tag parser via Cloudflare Worker → sites/URLs
- [ ] Tratamento de erro claro ("DOI não encontrado", "ISBN inválido")

### F3. Motor de formatação ABNT NBR 6023:2018
- [ ] 5 tipos de referência no MVP:
  1. Artigo de periódico
  2. Livro (monografia)
  3. Capítulo de livro
  4. Site / página web
  5. Trabalho acadêmico (TCC, dissertação, tese)
- [ ] Regras implementadas:
  - Sobrenome em CAIXA ALTA, prenomes abreviados
  - Tratamento de sobrenomes compostos BR (Da Silva, De Oliveira, Dos Santos)
  - "et al." para mais de 3 autores
  - Itálico no título de monografias e periódicos
  - Aspas em título de artigo/capítulo
  - Ordem: AUTOR. Título. Subtítulo. Edição. Local: Editora, ano.
  - Paginação (p. ou f.)
  - Disponível em / Acesso em (para fontes digitais)
  - Autor institucional (ex: BRASIL, IBGE, OMS)

### F4. Entrada manual por formulário
- [ ] Formulário dinâmico por tipo de referência selecionado
- [ ] Campos: autor(es), título, subtítulo, edição, local, editora, ano,
      volume, número, páginas, DOI, URL, data de acesso
- [ ] Botão "+" para adicionar múltiplos autores
- [ ] Validação inline (campos obrigatórios por tipo)

### F5. Área de resultado
- [ ] Referência formatada com tipografia correta (itálico real)
- [ ] Botão "Copiar" (clipboard API, com feedback "Copiado!")
- [ ] Preview lado a lado: ABNT formatado vs. dados brutos
- [ ] Indicador visual de campos opcionais que foram omitidos

### F6. Lista de referências (sessão)
- [ ] Acumula referências formatadas numa lista
- [ ] Ordenação alfabética automática (padrão ABNT)
- [ ] Remover item individual
- [ ] Limpar lista
- [ ] Persistência via localStorage
- [ ] Contador de referências

### F7. Exportação
- [ ] Copiar lista completa (texto formatado)
- [ ] Download BibTeX (.bib)
- [ ] Download RIS (.ris)
- [ ] Download texto plano (.txt)

### F8. SEO e landing pages
- [ ] Página principal (ferramenta)
- [ ] /como-citar-artigo-abnt — guia + exemplo interativo
- [ ] /como-citar-livro-abnt — guia + exemplo interativo
- [ ] /como-citar-site-abnt — guia + exemplo interativo
- [ ] Meta tags, Open Graph, Schema.org (HowTo)
- [ ] Sitemap.xml

---

## Funcionalidades — Pós-MVP (Pro)

### Pro 1. Conta e cloud sync
- [ ] Login (Supabase Auth)
- [ ] Listas salvas na nuvem
- [ ] Histórico de formatações

### Pro 2. Batch import
- [ ] Upload de .bib ou .ris → reformata pra ABNT
- [ ] Lista de DOIs (um por linha) → resolve e formata todos

### Pro 3. Mais tipos de referência
- [ ] Legislação (lei, decreto, portaria)
- [ ] Norma técnica
- [ ] Evento (anais de congresso)
- [ ] Patente
- [ ] Mapa, imagem, vídeo

### Pro 4. Integração com editores
- [ ] Extensão Chrome para Google Docs
- [ ] Plugin para Overleaf/LaTeX

---

## Monetização

| Tier | Preço | Inclui |
|------|-------|--------|
| Free | R$ 0 | 10 formatações/dia, exportação texto, lista até 20 refs |
| Pro | R$ 9,90/mês | Ilimitado, batch, cloud sync, BibTeX/RIS, sem ads |

Ads: Google AdSense apenas nas páginas de conteúdo SEO, nunca na ferramenta.

---

## Estrutura de arquivos

```
src/
├── engine/
│   ├── types.ts              # Tipos de referência e metadados
│   ├── formatter.ts          # Motor ABNT NBR 6023
│   ├── formatters/
│   │   ├── article.ts        # Artigo de periódico
│   │   ├── book.ts           # Livro
│   │   ├── chapter.ts        # Capítulo de livro
│   │   ├── website.ts        # Site / página web
│   │   └── thesis.ts         # Trabalho acadêmico
│   ├── resolvers/
│   │   ├── crossref.ts       # DOI → metadados via CrossRef
│   │   ├── openlibrary.ts    # ISBN → metadados via Open Library
│   │   └── metatags.ts       # URL → metadados via meta tags
│   ├── exporters/
│   │   ├── bibtex.ts         # Gera .bib
│   │   └── ris.ts            # Gera .ris
│   └── utils/
│       ├── authors.ts        # Parse e formatação de nomes
│       └── detect-input.ts   # Detecta tipo de input (DOI/ISBN/URL)
├── components/
│   ├── InputArea.tsx
│   ├── ManualForm.tsx
│   ├── ResultCard.tsx
│   ├── ReferenceList.tsx
│   ├── ExportMenu.tsx
│   └── CopyButton.tsx
├── pages/
│   ├── Home.tsx
│   └── guides/              # Páginas SEO (pós-MVP)
├── hooks/
│   ├── useReferences.ts     # Estado da lista de refs
│   └── useResolver.ts       # Lógica de resolução via API
├── styles/
│   └── global.css
├── App.tsx
└── main.tsx
```
