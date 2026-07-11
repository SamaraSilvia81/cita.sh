import { useState, useCallback } from 'react';
import type { InputType } from '../engine/types';
import { INPUT_TYPE_LABELS } from '../engine/utils/detect-input';

interface InputAreaProps {
  onSubmit: (value: string) => void;
  onDetect: (value: string) => void;
  detectedType: InputType | null;
  loading: boolean;
  onManualClick: () => void;
}

export function InputArea({ onSubmit, onDetect, detectedType, loading, onManualClick }: InputAreaProps) {
  const [value, setValue] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    onDetect(v);
  }, [onDetect]);

  const handleSubmit = useCallback(() => {
    if (value.trim() && !loading) {
      onSubmit(value.trim());
    }
  }, [value, loading, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <>
      <div className="input-card">
        <div className="input-header">
          <span className="input-label">cole aqui</span>
          {detectedType && detectedType !== 'manual' && (
            <span className="input-badge">
              <span className="input-badge-dot" />
              {INPUT_TYPE_LABELS[detectedType]}
            </span>
          )}
        </div>
        <input
          type="text"
          className="input-field"
          placeholder="DOI, ISBN ou URL..."
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        {detectedType === 'manual' && value.trim() && (
          <span className="input-annotation">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ verticalAlign: 'middle', marginRight: 3 }}>
              <path d="M7 1 L7 10 M4 7 L7 10 L10 7" stroke="#93032E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            use entrada manual
          </span>
        )}
      </div>

      <div className="btn-row">
        <button className="btn-format" onClick={handleSubmit} disabled={!value.trim() || loading}>
          {loading ? (
            <>
              <span className="spinner" />
              Buscando...
            </>
          ) : (
            <>
              Formatar ABNT
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8 L13 8 M10 5 L13 8 L10 11" stroke="#F0EDE5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>
        <button className="btn-format btn-secondary" onClick={onManualClick}>
          entrada manual
        </button>
      </div>
    </>
  );
}
