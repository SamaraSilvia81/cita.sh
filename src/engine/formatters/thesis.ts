import type { ThesisMetadata, ThesisType } from '../types';
import { formatAuthors } from '../utils/authors';

/**
 * Labels para tipo de trabalho acadêmico
 */
const THESIS_LABELS: Record<ThesisType, { type: string; degree: string }> = {
  tcc: { type: 'Trabalho de Conclusão de Curso', degree: 'Graduação' },
  dissertacao: { type: 'Dissertação', degree: 'Mestrado' },
  tese: { type: 'Tese', degree: 'Doutorado' },
};

/**
 * Formata trabalho acadêmico conforme ABNT NBR 6023:2018.
 *
 * Modelo:
 * SOBRENOME, P. **Título**: subtítulo. Ano. XXX f. Dissertação
 * (Mestrado em Programa) — Instituição, Cidade, ano.
 *
 * - Título em itálico
 * - Subtítulo sem itálico
 * - Tipo entre parênteses com grau e programa
 * - Travessão (—) antes da instituição
 */
export function formatThesis(data: ThesisMetadata): { plain: string; html: string } {
  const parts: { text: string; italic?: boolean }[] = [];
  const labels = THESIS_LABELS[data.thesisType];

  // Autores
  const authors = formatAuthors(data.authors);
  if (authors) {
    parts.push({ text: authors + '. ' });
  }

  // Título em itálico
  let title = data.title.replace(/\.$/, '');
  parts.push({ text: title, italic: true });

  // Subtítulo sem itálico
  if (data.subtitle) {
    parts.push({ text: `: ${data.subtitle}` });
  }

  parts.push({ text: '. ' });

  // Ano
  parts.push({ text: `${data.year || '[s. d.]'}. ` });

  // Total de folhas
  if (data.totalPages) {
    parts.push({ text: `${data.totalPages} f. ` });
  }

  // Tipo (Grau em Programa)
  parts.push({
    text: `${labels.type} (${labels.degree} em ${data.program})`,
  });

  // Travessão + Instituição, Cidade, ano
  parts.push({
    text: ` \u2014 ${data.institution}, ${data.city}, ${data.year || '[s. d.]'}.`,
  });

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
