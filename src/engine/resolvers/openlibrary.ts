import type { BookMetadata, Author } from '../types';

const OL_API = 'https://openlibrary.org';

interface OLBookResponse {
  title?: string;
  subtitle?: string;
  authors?: { key: string }[];
  publishers?: string[];
  publish_places?: string[];
  publish_date?: string;
  number_of_pages?: number;
  isbn_13?: string[];
  isbn_10?: string[];
}

interface OLAuthorResponse {
  name?: string;
  personal_name?: string;
}

/**
 * Resolve metadados de um ISBN via Open Library API.
 *
 * @param isbn - ISBN normalizado (somente dígitos, 10 ou 13)
 * @returns BookMetadata com dados do livro
 * @throws Error se o ISBN não for encontrado
 */
export async function resolveFromISBN(isbn: string): Promise<BookMetadata> {
  const response = await fetch(`${OL_API}/isbn/${isbn}.json`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`ISBN não encontrado: ${isbn}`);
    }
    throw new Error(`Erro ao consultar Open Library: ${response.status}`);
  }

  const data: OLBookResponse = await response.json();

  // Resolve nomes dos autores (precisa de request adicional)
  const authors: Author[] = [];
  if (data.authors) {
    for (const authorRef of data.authors.slice(0, 5)) {
      try {
        const authorData = await fetchAuthor(authorRef.key);
        if (authorData) {
          authors.push({
            fullName: authorData.personal_name || authorData.name || '',
          });
        }
      } catch {
        // Ignora erros de autor individual
      }
    }
  }

  // Extrai ano da data de publicação
  const year = extractYear(data.publish_date);

  return {
    type: 'book',
    authors,
    title: data.title || '',
    subtitle: data.subtitle,
    year,
    publisher: data.publishers?.[0],
    location: data.publish_places?.[0],
    totalPages: data.number_of_pages ? String(data.number_of_pages) : undefined,
    isbn: isbn,
  };
}

async function fetchAuthor(key: string): Promise<OLAuthorResponse | null> {
  try {
    const response = await fetch(`${OL_API}${key}.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function extractYear(publishDate?: string): string {
  if (!publishDate) return '[s. d.]';

  // Tenta extrair 4 dígitos de ano
  const match = publishDate.match(/(\d{4})/);
  return match ? match[1] : '[s. d.]';
}
