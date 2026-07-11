import type { FormattedReference } from '../types';

/**
 * Mapeia tipo de referência para tipo RIS
 */
const RIS_TYPE_MAP: Record<string, string> = {
  article: 'JOUR',
  book: 'BOOK',
  chapter: 'CHAP',
  website: 'ELEC',
  thesis: 'THES',
};

/**
 * Gera uma entrada RIS a partir de uma referência formatada.
 */
export function toRIS(ref: FormattedReference): string {
  const m = ref.metadata;
  const lines: string[] = [];

  lines.push(`TY  - ${RIS_TYPE_MAP[m.type] || 'GEN'}`);

  // Autores
  for (const author of m.authors) {
    const name = author.institutional
      ? author.fullName
      : formatRISAuthor(author.fullName);
    lines.push(`AU  - ${name}`);
  }

  // Título
  lines.push(`TI  - ${m.title}`);

  if (m.subtitle) {
    lines.push(`T2  - ${m.subtitle}`);
  }

  // Ano
  lines.push(`PY  - ${m.year || ''}`);

  // Campos específicos por tipo
  switch (m.type) {
    case 'article':
      if (m.journal) lines.push(`JO  - ${m.journal}`);
      if (m.volume) lines.push(`VL  - ${m.volume}`);
      if (m.issue) lines.push(`IS  - ${m.issue}`);
      if (m.pages) {
        const [sp, ep] = m.pages.split('-');
        if (sp) lines.push(`SP  - ${sp.trim()}`);
        if (ep) lines.push(`EP  - ${ep.trim()}`);
      }
      if (m.doi) lines.push(`DO  - ${m.doi}`);
      if (m.issn) lines.push(`SN  - ${m.issn}`);
      break;

    case 'book':
      if (m.publisher) lines.push(`PB  - ${m.publisher}`);
      if (m.location) lines.push(`CY  - ${m.location}`);
      if (m.edition) lines.push(`ET  - ${m.edition}`);
      if (m.isbn) lines.push(`SN  - ${m.isbn}`);
      break;

    case 'chapter':
      lines.push(`T2  - ${m.bookTitle}`);
      for (const editor of m.bookAuthors) {
        lines.push(`ED  - ${formatRISAuthor(editor.fullName)}`);
      }
      if (m.publisher) lines.push(`PB  - ${m.publisher}`);
      if (m.location) lines.push(`CY  - ${m.location}`);
      if (m.pages) {
        const [sp, ep] = m.pages.split('-');
        if (sp) lines.push(`SP  - ${sp.trim()}`);
        if (ep) lines.push(`EP  - ${ep.trim()}`);
      }
      break;

    case 'thesis':
      lines.push(`PB  - ${m.institution}`);
      lines.push(`CY  - ${m.city}`);
      break;

    case 'website':
      if (m.siteName) lines.push(`T2  - ${m.siteName}`);
      break;
  }

  // URL
  if (m.url) lines.push(`UR  - ${m.url}`);

  lines.push('ER  - ');

  return lines.join('\n');
}

/**
 * Gera arquivo .ris completo.
 */
export function toRISFile(refs: FormattedReference[]): string {
  return refs.map(toRIS).join('\n\n');
}

/**
 * Formata nome para RIS: "Sobrenome, Nome"
 */
function formatRISAuthor(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName;
  const surname = parts[parts.length - 1];
  const rest = parts.slice(0, -1).join(' ');
  return `${surname}, ${rest}`;
}
