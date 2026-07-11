import type { Author } from '../types';

/**
 * Preposições e partículas que fazem parte de sobrenomes compostos brasileiros/portugueses.
 * Essas partículas NÃO iniciam o sobrenome na formatação ABNT.
 * Ex: "João da Silva" → "SILVA, J. da"  (não "DA SILVA, J.")
 * Ex: "Maria de Oliveira Santos" → "SANTOS, M. de O."
 */
const PARTICLES = new Set([
  'da', 'das', 'de', 'do', 'dos',
  'e',
  'del', 'della', 'di', 'du',
  'van', 'von', 'der', 'den',
  'la', 'le', 'les',
]);

/**
 * Sobrenomes compostos conhecidos que devem ser tratados como unidade.
 * Ex: "Villa-Lobos" é um sobrenome, não "Lobos" com partícula "Villa".
 */
const COMPOUND_SURNAMES = new Set([
  'villa-lobos',
  'castelo branco',
  'espírito santo',
  'santa cruz',
  'monte alegre',
]);

/**
 * Formata um único autor no padrão ABNT.
 *
 * Regras:
 * - Pessoal: SOBRENOME, Prenome(s) abreviado(s).
 * - Institucional: NOME EM CAIXA ALTA
 * - Partículas (da, de, dos) ficam após o prenome: SILVA, J. da
 *
 * @example
 * formatAuthor({ fullName: "João Almeida da Silva" })
 * // → "SILVA, J. A. da"
 *
 * formatAuthor({ fullName: "IBGE", institutional: true })
 * // → "IBGE"
 */
export function formatAuthor(author: Author): string {
  if (author.institutional) {
    return author.fullName.toUpperCase();
  }

  const parts = author.fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].toUpperCase();
  }

  // Separa partículas, prenomes e sobrenome
  const particles: string[] = [];
  const nameTokens: string[] = [];

  for (const part of parts) {
    if (PARTICLES.has(part.toLowerCase())) {
      particles.push(part.toLowerCase());
    } else {
      nameTokens.push(part);
    }
  }

  if (nameTokens.length === 0) {
    return parts.map(p => p.toUpperCase()).join(' ');
  }

  // Último token de nome é o sobrenome (ou composto)
  const surname = nameTokens[nameTokens.length - 1];
  const firstNames = nameTokens.slice(0, -1);

  // Abrevia prenomes: "João" → "J."
  const abbreviated = firstNames
    .map(name => `${name.charAt(0).toUpperCase()}.`)
    .join(' ');

  // Monta: SOBRENOME, J. A. da
  let result = surname.toUpperCase();

  if (abbreviated) {
    result += `, ${abbreviated}`;
  }

  if (particles.length > 0) {
    result += ` ${particles.join(' ')}`;
  }

  return result;
}

/**
 * Formata lista de autores conforme ABNT NBR 6023:2018.
 *
 * Regras:
 * - 1 autor: SOBRENOME, P.
 * - 2-3 autores: SOBRENOME, P.; SOBRENOME, P.; SOBRENOME, P.
 * - 4+ autores: SOBRENOME, P. et al.
 */
export function formatAuthors(authors: Author[]): string {
  if (authors.length === 0) return '';

  if (authors.length <= 3) {
    return authors.map(formatAuthor).join('; ');
  }

  // 4 ou mais: primeiro autor + et al.
  return `${formatAuthor(authors[0])} et al.`;
}

/**
 * Parse de string de autor(es) em objetos Author.
 * Aceita formatos comuns:
 * - "João da Silva"
 * - "João da Silva; Maria Santos"
 * - "João da Silva, Maria Santos" (vírgula como separador de autores)
 * - "IBGE" (detecta institucional se tudo maiúsculo e uma palavra)
 */
export function parseAuthors(input: string): Author[] {
  if (!input.trim()) return [];

  // Separa por ponto e vírgula primeiro
  const parts = input.includes(';')
    ? input.split(';')
    : input.split(/,\s*(?=[A-Z])/); // Vírgula seguida de maiúscula

  return parts
    .map(part => part.trim())
    .filter(Boolean)
    .map(name => ({
      fullName: name,
      institutional: isInstitutional(name),
    }));
}

/**
 * Detecta se um nome é institucional.
 * Heurística: tudo em maiúsculas, ou siglas conhecidas.
 */
function isInstitutional(name: string): boolean {
  const trimmed = name.trim();

  // Siglas (2-10 caracteres, tudo maiúsculo, sem espaço)
  if (/^[A-ZÀ-Ú]{2,10}$/.test(trimmed)) return true;

  // Nomes conhecidos de instituições
  const known = [
    'brasil', 'ibge', 'oms', 'who', 'onu', 'un',
    'abnt', 'inep', 'mec', 'capes', 'cnpq',
  ];
  if (known.includes(trimmed.toLowerCase())) return true;

  return false;
}
