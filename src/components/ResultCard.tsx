import { useState, useCallback } from 'react';
import type { FormattedReference } from '../engine/types';
import { toBibTeX } from '../engine/exporters/bibtex';
import { toRIS } from '../engine/exporters/ris';

interface ResultCardProps {
  reference: FormattedReference;
  onAddToList: (ref: FormattedReference) => void;
  listIsFull: boolean;
}

export function ResultCard({ reference, onAddToList, listIsFull }: ResultCardProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    }
  }, []);

  const handleCopy = () => copyText(reference.abnt, 'copy');
  const handleBibTeX = () => copyText(toBibTeX(reference), 'bibtex');
  const handleRIS = () => copyText(toRIS(reference), 'ris');

  return (
    <div className="result-card">
      <div className="result-header">
        <span className="result-label">Referência formatada</span>
        <span className="result-hand">pronta!</span>
      </div>
      <div
        className="result-text"
        dangerouslySetInnerHTML={{ __html: reference.abntHtml }}
      />
      <div className="result-actions">
        <button
          className={`btn-action primary${copied === 'copy' ? ' btn-copied' : ''}`}
          onClick={handleCopy}
        >
          {copied === 'copy' ? 'copiado!' : 'copiar'}
        </button>
        <button
          className={`btn-action${copied === 'bibtex' ? ' btn-copied' : ''}`}
          onClick={handleBibTeX}
        >
          {copied === 'bibtex' ? 'copiado!' : 'bibtex'}
        </button>
        <button
          className={`btn-action${copied === 'ris' ? ' btn-copied' : ''}`}
          onClick={handleRIS}
        >
          {copied === 'ris' ? 'copiado!' : 'ris'}
        </button>
        <button
          className="btn-action"
          onClick={() => onAddToList(reference)}
          disabled={listIsFull}
        >
          + lista
        </button>
      </div>
    </div>
  );
}
