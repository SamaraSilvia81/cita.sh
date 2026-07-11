import type { FormattedReference, ReferenceMetadata } from '../types';

/**
 * Gera uma entrada BibTeX a partir de uma referência formatada.
 */
export function toBibTeX(ref: FormattedReference): string {
  const m = ref.metadata;
  const key = generateBibKey(m);

  switch (m.type) {
    case 'article':
      return [
        `@article{${key},`,
        `  author = {${authorsToLatex(m.authors)}},`,
        `  title = {${m.title}},`,
        m.journal ? `  journal = {${m.journal}},` : null,
        m.volume ? `  volume = {${m.volume}},` : null,
        m.issue ? `  number = {${m.issue}},` : null,
        m.pages ? `  pages = {${m.pages}},` : null,
        `  year = {${m.year}},`,
        m.doi ? `  doi = {${m.doi}},` : null,
        m.url ? `  url = {${m.url}},` : null,
        '}',
      ]
        .filter(Boolean)
        .join('\n');

    case 'book':
      return [
        `@book{${key},`,
        `  author = {${authorsToLatex(m.authors)}},`,
        `  title = {${m.title}},`,
        m.publisher ? `  publisher = {${m.publisher}},` : null,
        m.location ? `  address = {${m.location}},` : null,
        m.edition ? `  edition = {${m.edition}},` : null,
        `  year = {${m.year}},`,
        m.isbn ? `  isbn = {${m.isbn}},` : null,
        m.url ? `  url = {${m.url}},` : null,
        '}',
      ]
        .filter(Boolean)
        .join('\n');

    case 'chapter':
      return [
        `@incollection{${key},`,
        `  author = {${authorsToLatex(m.authors)}},`,
        `  title = {${m.title}},`,
        `  booktitle = {${m.bookTitle}},`,
        m.bookAuthors.length > 0
          ? `  editor = {${authorsToLatex(m.bookAuthors)}},`
          : null,
        m.publisher ? `  publisher = {${m.publisher}},` : null,
        m.location ? `  address = {${m.location}},` : null,
        m.pages ? `  pages = {${m.pages}},` : null,
        `  year = {${m.year}},`,
        '}',
      ]
        .filter(Boolean)
        .join('\n');

    case 'thesis':
      return [
        `@mastersthesis{${key},`,
        `  author = {${authorsToLatex(m.authors)}},`,
        `  title = {${m.title}},`,
        `  school = {${m.institution}},`,
        `  address = {${m.city}},`,
        `  year = {${m.year}},`,
        `  type = {${m.thesisType === 'tese' ? 'Tese de Doutorado' : m.thesisType === 'dissertacao' ? 'Dissertação de Mestrado' : 'Trabalho de Conclusão de Curso'}},`,
        m.url ? `  url = {${m.url}},` : null,
        '}',
      ]
        .filter(Boolean)
        .join('\n');

    case 'website':
      return [
        `@misc{${key},`,
        m.authors.length > 0
          ? `  author = {${authorsToLatex(m.authors)}},`
          : null,
        `  title = {${m.title}},`,
        m.siteName ? `  howpublished = {${m.siteName}},` : null,
        `  year = {${m.year}},`,
        m.url ? `  url = {${m.url}},` : null,
        m.accessDate ? `  note = {Acesso em: ${m.accessDate}},` : null,
        '}',
      ]
        .filter(Boolean)
        .join('\n');

    default:
      return `% Tipo não suportado: ${(m as any).type}`;
  }
}

/**
 * Gera arquivo .bib completo a partir de uma lista de referências.
 */
export function toBibTeXFile(refs: FormattedReference[]): string {
  return refs.map(toBibTeX).join('\n\n');
}

function authorsToLatex(
  authors: { fullName: string; institutional?: boolean }[]
): string {
  return authors.map((a) => a.fullName).join(' and ');
}

function generateBibKey(m: ReferenceMetadata): string {
  const firstAuthor =
    m.authors.length > 0
      ? m.authors[0].fullName
          .split(/\s+/)
          .pop()
          ?.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') || 'unknown'
      : 'unknown';
  const year = m.year?.replace(/[^\d]/g, '') || 'nd';
  return `${firstAuthor}${year}`;
}
