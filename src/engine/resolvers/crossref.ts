import type { ArticleMetadata, BookMetadata, Author } from '../types';

const CROSSREF_API = 'https://api.crossref.org/works';

interface CrossRefAuthor {
  given?: string;
  family?: string;
  name?: string; // Para autores institucionais
}

interface CrossRefResponse {
  status: string;
  message: {
    type: string;
    title: string[];
    subtitle?: string[];
    author?: CrossRefAuthor[];
    'container-title'?: string[];
    volume?: string;
    issue?: string;
    page?: string;
    published?: { 'date-parts': number[][] };
    'published-print'?: { 'date-parts': number[][] };
    'published-online'?: { 'date-parts': number[][] };
    DOI?: string;
    ISSN?: string[];
    ISBN?: string[];
    publisher?: string;
    'publisher-location'?: string;
  };
}

/**
 * Resolve metadados de um DOI via CrossRef API.
 *
 * A CrossRef retorna dados de artigos, livros, capítulos, etc.
 * Esta função mapeia para ArticleMetadata ou BookMetadata dependendo do tipo.
 *
 * @param doi - DOI normalizado (sem prefixo https://doi.org/)
 * @returns Metadados mapeados para o tipo ABNT
 * @throws Error se o DOI não for encontrado ou a API falhar
 */
export async function resolveFromDOI(
  doi: string
): Promise<ArticleMetadata | BookMetadata> {
  const response = await fetch(`${CROSSREF_API}/${encodeURIComponent(doi)}`, {
    headers: {
      'User-Agent': 'ABNTFormatter/1.0 (https://github.com/abnt-formatter; mailto:contact@example.com)',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`DOI não encontrado: ${doi}`);
    }
    throw new Error(`Erro ao consultar CrossRef: ${response.status}`);
  }

  const data: CrossRefResponse = await response.json();
  const msg = data.message;

  // Extrai autores
  const authors: Author[] = (msg.author || []).map(mapCrossRefAuthor);

  // Extrai ano
  const year = extractYear(msg);

  // Extrai título
  const title = msg.title?.[0] || '';
  const subtitle = msg.subtitle?.[0];

  // Determina tipo baseado no campo type da CrossRef
  const isBook = msg.type === 'book' || msg.type === 'monograph';

  if (isBook) {
    return {
      type: 'book',
      authors,
      title,
      subtitle,
      year,
      publisher: msg.publisher,
      location: msg['publisher-location'],
      isbn: msg.ISBN?.[0],
      doi,
    } satisfies BookMetadata;
  }

  // Default: artigo de periódico
  return {
    type: 'article',
    authors,
    title,
    subtitle,
    year,
    journal: msg['container-title']?.[0] || '',
    volume: msg.volume,
    issue: msg.issue,
    pages: msg.page,
    issn: msg.ISSN?.[0],
    doi,
  } satisfies ArticleMetadata;
}

function mapCrossRefAuthor(author: CrossRefAuthor): Author {
  if (author.name) {
    return { fullName: author.name, institutional: true };
  }
  const given = author.given || '';
  const family = author.family || '';
  return { fullName: `${given} ${family}`.trim() };
}

function extractYear(msg: CrossRefResponse['message']): string {
  const dateFields = [msg.published, msg['published-print'], msg['published-online']];
  for (const field of dateFields) {
    if (field?.['date-parts']?.[0]?.[0]) {
      return String(field['date-parts'][0][0]);
    }
  }
  return '[s. d.]';
}
