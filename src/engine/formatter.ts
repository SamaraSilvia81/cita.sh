import type { ReferenceMetadata, FormattedReference } from './types';
import { formatArticle } from './formatters/article';
import { formatBook } from './formatters/book';
import { formatChapter } from './formatters/chapter';
import { formatWebsite } from './formatters/website';
import { formatThesis } from './formatters/thesis';

let counter = 0;

function generateId(): string {
  counter += 1;
  return `ref-${Date.now()}-${counter}`;
}

/**
 * Formata uma referência bibliográfica conforme ABNT NBR 6023:2018.
 *
 * Dispatcha para o formatador específico com base no tipo de referência.
 *
 * @param metadata - Metadados da referência
 * @returns Referência formatada com versões plain text e HTML
 */
export function formatReference(metadata: ReferenceMetadata): FormattedReference {
  let result: { plain: string; html: string };

  switch (metadata.type) {
    case 'article':
      result = formatArticle(metadata);
      break;
    case 'book':
      result = formatBook(metadata);
      break;
    case 'chapter':
      result = formatChapter(metadata);
      break;
    case 'website':
      result = formatWebsite(metadata);
      break;
    case 'thesis':
      result = formatThesis(metadata);
      break;
    default:
      throw new Error(`Tipo de referência não suportado: ${(metadata as any).type}`);
  }

  return {
    id: generateId(),
    abnt: result.plain,
    abntHtml: result.html,
    plain: result.plain,
    metadata,
    createdAt: Date.now(),
  };
}

/**
 * Ordena referências em ordem alfabética pelo texto formatado (padrão ABNT).
 */
export function sortReferences(refs: FormattedReference[]): FormattedReference[] {
  return [...refs].sort((a, b) =>
    a.abnt.localeCompare(b.abnt, 'pt-BR', { sensitivity: 'base' })
  );
}
