import type { WebsiteMetadata } from '../types';
import { formatAuthors } from '../utils/authors';

/**
 * Formata referência de site/página web conforme ABNT NBR 6023:2018.
 *
 * Modelos possíveis:
 *
 * Com autor:
 * SOBRENOME, P. Título da página. **Nome do Site**, ano.
 * Disponível em: URL. Acesso em: data.
 *
 * Sem autor (entrada pelo título):
 * TÍTULO da página. **Nome do Site**, ano.
 * Disponível em: URL. Acesso em: data.
 *
 * Nota: quando não há autor, a primeira palavra do título fica em CAIXA ALTA.
 */
export function formatWebsite(data: WebsiteMetadata): { plain: string; html: string } {
  const parts: { text: string; italic?: boolean }[] = [];

  const hasAuthors = data.authors.length > 0;

  if (hasAuthors) {
    // Com autor
    const authors = formatAuthors(data.authors);
    parts.push({ text: authors + '. ' });

    // Título da página (sem itálico)
    let title = data.title.replace(/\.$/, '');
    if (data.subtitle) {
      title += `: ${data.subtitle}`;
    }
    parts.push({ text: title + '. ' });
  } else {
    // Sem autor: primeira palavra do título em CAIXA ALTA
    let title = data.title.replace(/\.$/, '');
    if (data.subtitle) {
      title += `: ${data.subtitle}`;
    }
    title = capitalizeFirstWord(title);
    parts.push({ text: title + '. ' });
  }

  // Nome do site em itálico
  if (data.siteName) {
    parts.push({ text: data.siteName, italic: true });
    parts.push({ text: ', ' });
  }

  // Ano ou data de publicação
  if (data.publishDate) {
    parts.push({ text: data.publishDate });
  } else if (data.year) {
    parts.push({ text: data.year });
  } else {
    parts.push({ text: '[s. d.]' });
  }

  parts.push({ text: '.' });

  // Disponível em (obrigatório pra web)
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

/**
 * Coloca a primeira palavra em CAIXA ALTA.
 * "Título da página" → "TÍTULO da página"
 */
function capitalizeFirstWord(text: string): string {
  const spaceIndex = text.indexOf(' ');
  if (spaceIndex === -1) return text.toUpperCase();
  return text.substring(0, spaceIndex).toUpperCase() + text.substring(spaceIndex);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
