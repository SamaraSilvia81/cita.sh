// Types
export type {
  ReferenceType,
  ThesisType,
  Author,
  BaseMetadata,
  ArticleMetadata,
  BookMetadata,
  ChapterMetadata,
  WebsiteMetadata,
  ThesisMetadata,
  ReferenceMetadata,
  FormattedReference,
  InputType,
  DetectedInput,
} from './types';

// Core formatter
export { formatReference, sortReferences } from './formatter';

// Input detection
export { detectInput, INPUT_TYPE_LABELS } from './utils/detect-input';

// Author utilities
export { formatAuthor, formatAuthors, parseAuthors } from './utils/authors';

// API resolvers
export { resolveFromDOI } from './resolvers/crossref';
export { resolveFromISBN } from './resolvers/openlibrary';

// Exporters
export { toBibTeX, toBibTeXFile } from './exporters/bibtex';
export { toRIS, toRISFile } from './exporters/ris';
