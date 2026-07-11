import type { DetectedInput } from '../types';

/**
 * Regex para DOI.
 * Formatos aceitos:
 * - 10.1234/abc.def
 * - https://doi.org/10.1234/abc.def
 * - doi:10.1234/abc.def
 */
const DOI_REGEX = /(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)?(\b10\.\d{4,9}\/[^\s]+)/i;

/**
 * Regex para ISBN (10 ou 13 dígitos, com ou sem hifens).
 * ISBN-10: 0-306-40615-2
 * ISBN-13: 978-3-16-148410-0
 */
const ISBN_REGEX = /^(?:isbn[:\s]*)?(\d{1,5}[-\s]?\d{1,7}[-\s]?\d{1,7}[-\s]?[\dxX])$|^(?:isbn[:\s]*)?(\d{13})$|^(?:isbn[:\s]*)?((?:\d[-\s]?){9}[\dxX])$|^(?:isbn[:\s]*)?((?:\d[-\s]?){12}\d)$/i;

/**
 * Regex para URL.
 */
const URL_REGEX = /^https?:\/\/.+/i;

/**
 * Detecta o tipo de input e normaliza o valor.
 *
 * @example
 * detectInput("10.1145/3360901")
 * // → { type: 'doi', value: '10.1145/3360901', normalized: '10.1145/3360901' }
 *
 * detectInput("https://doi.org/10.1145/3360901")
 * // → { type: 'doi', value: 'https://doi.org/10.1145/3360901', normalized: '10.1145/3360901' }
 *
 * detectInput("978-3-16-148410-0")
 * // → { type: 'isbn', value: '978-3-16-148410-0', normalized: '9783161484100' }
 */
export function detectInput(input: string): DetectedInput {
  const trimmed = input.trim();

  // Tenta DOI primeiro (pode estar dentro de uma URL)
  const doiMatch = trimmed.match(DOI_REGEX);
  if (doiMatch) {
    const doi = doiMatch[1];
    return {
      type: 'doi',
      value: trimmed,
      normalized: doi,
    };
  }

  // Tenta ISBN
  const cleanForIsbn = trimmed.replace(/^isbn[:\s]*/i, '').trim();
  const digitsOnly = cleanForIsbn.replace(/[-\s]/g, '');
  if (/^\d{10}$/.test(digitsOnly) || /^\d{13}$/.test(digitsOnly) || /^\d{9}[\dxX]$/.test(digitsOnly)) {
    return {
      type: 'isbn',
      value: trimmed,
      normalized: digitsOnly,
    };
  }

  // Tenta URL
  if (URL_REGEX.test(trimmed)) {
    return {
      type: 'url',
      value: trimmed,
      normalized: trimmed,
    };
  }

  // Fallback: entrada manual
  return {
    type: 'manual',
    value: trimmed,
    normalized: trimmed,
  };
}

/**
 * Labels em português para cada tipo de input
 */
export const INPUT_TYPE_LABELS: Record<string, string> = {
  doi: 'DOI detectado',
  isbn: 'ISBN detectado',
  url: 'URL detectada',
  manual: 'Entrada manual',
};
