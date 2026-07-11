/**
 * Tipos de referência suportados pela ABNT NBR 6023:2018
 */
export type ReferenceType =
  | 'article'   // Artigo de periódico
  | 'book'      // Livro (monografia)
  | 'chapter'   // Capítulo de livro
  | 'website'   // Site / página web
  | 'thesis';   // Trabalho acadêmico (TCC, dissertação, tese)

/**
 * Tipo de trabalho acadêmico
 */
export type ThesisType = 'tcc' | 'dissertacao' | 'tese';

/**
 * Autor — pode ser pessoal ou institucional
 */
export interface Author {
  /** Nome completo ou nome da instituição */
  fullName: string;
  /** Se true, trata como autor institucional (ex: BRASIL, IBGE) */
  institutional?: boolean;
}

/**
 * Metadados base compartilhados por todos os tipos
 */
export interface BaseMetadata {
  type: ReferenceType;
  authors: Author[];
  title: string;
  subtitle?: string;
  year: string;
  /** URL de acesso digital */
  url?: string;
  /** Data de acesso no formato "DD mês. AAAA" */
  accessDate?: string;
  /** DOI original (para exibição, não formatação) */
  doi?: string;
}

/**
 * Artigo de periódico
 * Ex: SILVA, J. A. et al. Título do artigo. **Título do Periódico**, v. 10, n. 2, p. 15-28, 2023.
 */
export interface ArticleMetadata extends BaseMetadata {
  type: 'article';
  /** Nome do periódico */
  journal: string;
  /** Volume */
  volume?: string;
  /** Número / Issue */
  issue?: string;
  /** Páginas (ex: "15-28") */
  pages?: string;
  /** ISSN */
  issn?: string;
}

/**
 * Livro (monografia)
 * Ex: SILVA, J. A. **Título do livro**. 2. ed. São Paulo: Editora, 2023.
 */
export interface BookMetadata extends BaseMetadata {
  type: 'book';
  /** Edição (ex: "2" para "2. ed.") */
  edition?: string;
  /** Local de publicação */
  location?: string;
  /** Editora */
  publisher?: string;
  /** Total de páginas (ex: "320 p.") */
  totalPages?: string;
  /** ISBN */
  isbn?: string;
}

/**
 * Capítulo de livro
 * Ex: SILVA, J. A. Título do capítulo. In: SOUZA, M. B. (org.). **Título do livro**. 
 *     São Paulo: Editora, 2023. p. 45-67.
 */
export interface ChapterMetadata extends BaseMetadata {
  type: 'chapter';
  /** Título do livro que contém o capítulo */
  bookTitle: string;
  /** Subtítulo do livro */
  bookSubtitle?: string;
  /** Organizadores/editores do livro */
  bookAuthors: Author[];
  /** Tipo de responsabilidade: org., ed., coord. */
  bookAuthorRole?: string;
  edition?: string;
  location?: string;
  publisher?: string;
  /** Páginas do capítulo (ex: "45-67") */
  pages?: string;
}

/**
 * Site / Página web
 * Ex: TÍTULO da página. Nome do site, ano. Disponível em: URL. Acesso em: data.
 */
export interface WebsiteMetadata extends BaseMetadata {
  type: 'website';
  /** Nome do site (ex: "G1", "Wikipedia") */
  siteName?: string;
  /** Data de publicação no site */
  publishDate?: string;
}

/**
 * Trabalho acadêmico (TCC, Dissertação, Tese)
 * Ex: SILVA, J. A. **Título**. 2023. 120 f. Dissertação (Mestrado em Computação) — 
 *     Universidade Federal de Pernambuco, Recife, 2023.
 */
export interface ThesisMetadata extends BaseMetadata {
  type: 'thesis';
  /** Tipo do trabalho */
  thesisType: ThesisType;
  /** Curso/programa (ex: "Ciência da Computação") */
  program: string;
  /** Instituição */
  institution: string;
  /** Cidade da instituição */
  city: string;
  /** Total de folhas (ex: "120") */
  totalPages?: string;
}

/**
 * Union type de todos os metadados
 */
export type ReferenceMetadata =
  | ArticleMetadata
  | BookMetadata
  | ChapterMetadata
  | WebsiteMetadata
  | ThesisMetadata;

/**
 * Resultado da formatação
 */
export interface FormattedReference {
  /** ID único */
  id: string;
  /** Texto formatado em ABNT (com marcações de itálico) */
  abnt: string;
  /** Texto formatado em ABNT (HTML com <em> para itálico) */
  abntHtml: string;
  /** Texto puro sem formatação */
  plain: string;
  /** Metadados originais */
  metadata: ReferenceMetadata;
  /** Timestamp de criação */
  createdAt: number;
}

/**
 * Tipo de input detectado
 */
export type InputType = 'doi' | 'isbn' | 'url' | 'manual';

/**
 * Resultado da detecção de input
 */
export interface DetectedInput {
  type: InputType;
  value: string;
  /** Valor normalizado (DOI sem prefixo, ISBN sem hifens, etc.) */
  normalized: string;
}
