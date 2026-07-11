import type { ArticleMetadata } from '../types';
import { formatAuthors } from '../utils/authors';

/**
 * Formata artigo de periódico conforme ABNT NBR 6023:2018.
 *
 * Modelo:
 * SOBRENOME, P. Título do artigo. **Título do Periódico**, Local, v. X, n. Y, p. XX-YY, ano.
 *
 * - Título do periódico em itálico (negrito no modelo acima)
 * - Título do artigo em fonte normal
 * - "et al." se mais de 3 autores
 *
 * @returns Objeto com versão plain text e HTML (com <em> para itálico)
 */
export function formatArticle(data: ArticleMetadata): { plain: string; html: string } {
  const parts: { text: string; italic?: boolean }[] = [];

  // Autores
  const authors = formatAuthors(data.authors);
  if (authors) {
    parts.push({ text: authors + '. ' });
  }

  // Título do artigo (sem itálico)
  let title = data.title;
  if (title && !title.endsWith('.')) title += '.';
  if (data.subtitle) {
    // Remove ponto do título antes do subtítulo
    title = title.replace(/\.$/, '');
    title += `: ${data.subtitle}.`;
  }
  parts.push({ text: title + ' ' });

  // Nome do periódico (em itálico)
  let journal = data.journal;
  if (journal) {
    // Remove ponto final se já tiver, vamos adicionar depois
    journal = journal.replace(/\.$/, '');
    parts.push({ text: journal, italic: true });
  }

  // Complementos: volume, número, páginas
  const complements: string[] = [];

  if (data.volume) {
    complements.push(`v. ${data.volume}`);
  }

  if (data.issue) {
    complements.push(`n. ${data.issue}`);
  }

  if (data.pages) {
    complements.push(`p. ${data.pages}`);
  }

  if (complements.length > 0) {
    parts.push({ text: ', ' + complements.join(', ') });
  }

  // Ano
  if (data.year) {
    parts.push({ text: `, ${data.year}` });
  }

  parts.push({ text: '.' });

  // Disponível em / Acesso em
  if (data.url) {
    parts.push({ text: ` Disponível em: ${data.url}.` });
    if (data.accessDate) {
      parts.push({ text: ` Acesso em: ${data.accessDate}.` });
    }
  }

  // Gera plain e HTML
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
