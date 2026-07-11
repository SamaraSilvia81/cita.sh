import type { ChapterMetadata } from '../types';
import { formatAuthors } from '../utils/authors';

/**
 * Formata capítulo de livro conforme ABNT NBR 6023:2018.
 *
 * Modelo:
 * SOBRENOME, P. Título do capítulo. In: SOBRENOME, P. (org.). **Título do livro**.
 * X. ed. Local: Editora, ano. p. XX-YY.
 *
 * - Título do capítulo sem itálico
 * - Título do livro em itálico
 * - "In:" liga capítulo ao livro
 */
export function formatChapter(data: ChapterMetadata): { plain: string; html: string } {
  const parts: { text: string; italic?: boolean }[] = [];

  // Autores do capítulo
  const chapterAuthors = formatAuthors(data.authors);
  if (chapterAuthors) {
    parts.push({ text: chapterAuthors + '. ' });
  }

  // Título do capítulo (sem itálico)
  let title = data.title.replace(/\.$/, '');
  if (data.subtitle) {
    title += `: ${data.subtitle}`;
  }
  parts.push({ text: title + '. ' });

  // "In:" + autores/organizadores do livro
  const bookAuthors = formatAuthors(data.bookAuthors);
  const role = data.bookAuthorRole || 'org.';
  if (bookAuthors) {
    parts.push({ text: `In: ${bookAuthors} (${role}). ` });
  } else {
    parts.push({ text: 'In: ' });
  }

  // Título do livro em itálico
  let bookTitle = data.bookTitle.replace(/\.$/, '');
  parts.push({ text: bookTitle, italic: true });

  // Subtítulo do livro (sem itálico)
  if (data.bookSubtitle) {
    parts.push({ text: `: ${data.bookSubtitle}` });
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
  }

  // Ano
  parts.push({ text: data.year || '[s. d.]' });

  parts.push({ text: '.' });

  // Páginas do capítulo
  if (data.pages) {
    parts.push({ text: ` p. ${data.pages}.` });
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
