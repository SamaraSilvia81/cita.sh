import type { BookMetadata } from '../types';
import { formatAuthors } from '../utils/authors';

/**
 * Formata livro (monografia) conforme ABNT NBR 6023:2018.
 *
 * Modelo:
 * SOBRENOME, P. **Título do livro**: subtítulo. X. ed. Local: Editora, ano. XXX p.
 *
 * - Título do livro em itálico
 * - Subtítulo sem itálico (após dois-pontos)
 * - Edição abreviada: "2. ed."
 */
export function formatBook(data: BookMetadata): { plain: string; html: string } {
  const parts: { text: string; italic?: boolean }[] = [];

  // Autores
  const authors = formatAuthors(data.authors);
  if (authors) {
    parts.push({ text: authors + '. ' });
  }

  // Título em itálico
  let title = data.title.replace(/\.$/, '');
  parts.push({ text: title, italic: true });

  // Subtítulo sem itálico (após dois-pontos)
  if (data.subtitle) {
    parts.push({ text: `: ${data.subtitle}` });
  }

  parts.push({ text: '. ' });

  // Edição
  if (data.edition && data.edition !== '1') {
    parts.push({ text: `${data.edition}. ed. ` });
  }

  // Local: Editora
  if (data.location && data.publisher) {
    parts.push({ text: `${data.location}: ${data.publisher}, ` });
  } else if (data.publisher) {
    parts.push({ text: `[S. l.]: ${data.publisher}, ` });
  } else if (data.location) {
    parts.push({ text: `${data.location}: [s. n.], ` });
  } else {
    parts.push({ text: '[S. l.: s. n.], ' });
  }

  // Ano
  parts.push({ text: data.year || '[s. d.]' });

  parts.push({ text: '.' });

  // Total de páginas
  if (data.totalPages) {
    parts.push({ text: ` ${data.totalPages} p.` });
  }

  // Disponível em / Acesso em
  if (data.url) {
    parts.push({ text: ` Disponível em: ${data.url}.` });
    if (data.accessDate) {
      parts.push({ text: ` Acesso em: ${data.accessDate}.` });
    }
  }

  const plain = parts.map(p => p.text).join('');
  const html = parts
    .map(p => (p.italic ? `<em>${escapeHtml(p.text)}</em>` : escapeHtml(p.text)))
    .join('');

  return { plain, html };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
