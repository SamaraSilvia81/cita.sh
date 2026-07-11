import { useCallback } from 'react';
import type { FormattedReference } from '../engine/types';
import { toBibTeXFile } from '../engine/exporters/bibtex';
import { toRISFile } from '../engine/exporters/ris';

interface ReferenceListProps {
  references: FormattedReference[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReferenceList({ references, onRemove, onClear }: ReferenceListProps) {
  const exportText = useCallback(() => {
    const text = references.map(r => r.abnt).join('\n\n');
    navigator.clipboard.writeText(text);
  }, [references]);

  const exportBibTeX = useCallback(() => {
    downloadFile(toBibTeXFile(references), 'referencias.bib', 'application/x-bibtex');
  }, [references]);

  const exportRIS = useCallback(() => {
    downloadFile(toRISFile(references), 'referencias.ris', 'application/x-research-info-systems');
  }, [references]);

  if (references.length === 0) return null;

  return (
    <div className="ref-list">
      <div className="ref-list-header">
        <span className="ref-list-title">
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" style={{ verticalAlign: -2, marginRight: 6 }}>
            <path d="M1 3 L5 3 M1 7 L5 7 M1 11 L5 11 M8 3 L17 3 M8 7 L17 7 M8 11 L14 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Minha lista
        </span>
        <span className="ref-list-count">{references.length} ref{references.length !== 1 ? 's' : ''}</span>
      </div>

      <div>
        {references.map((ref) => (
          <div key={ref.id} className="ref-item">
            <div
              className="ref-item-text"
              dangerouslySetInnerHTML={{ __html: ref.abntHtml }}
            />
            <button className="ref-item-remove" onClick={() => onRemove(ref.id)} title="Remover">
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="export-row">
        <button className="btn-action primary" onClick={exportText}>copiar tudo</button>
        <button className="btn-action" onClick={exportBibTeX}>baixar .bib</button>
        <button className="btn-action" onClick={exportRIS}>baixar .ris</button>
        <button className="btn-action" onClick={onClear} style={{ marginLeft: 'auto', color: 'var(--subtle)', borderColor: 'var(--border-light)' }}>limpar</button>
      </div>
    </div>
  );
}
