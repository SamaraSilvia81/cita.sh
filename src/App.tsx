import { useState, useCallback } from 'react';
import { ScribbleUnderline } from './components/HandDrawn';
import { InputArea } from './components/InputArea';
import { ManualForm } from './components/ManualForm';
import { ResultCard } from './components/ResultCard';
import { ReferenceList } from './components/ReferenceList';
import { useReferences } from './hooks/useReferences';
import { useResolver } from './hooks/useResolver';
import { formatReference } from './engine/formatter';
import type { ReferenceMetadata, FormattedReference } from './engine/types';
import './styles/global.css';

export default function App() {
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [lastResult, setLastResult] = useState<FormattedReference | null>(null);
  const { references, addReference, removeReference, clearAll, isFull } = useReferences();
  const { loading, error, detectedType, detect, resolve, clearError } = useResolver();

  const handleAutoSubmit = useCallback(async (input: string) => {
    clearError();
    const metadata = await resolve(input);
    if (metadata) {
      const formatted = formatReference(metadata);
      setLastResult(formatted);
    }
  }, [resolve, clearError]);

  const handleManualSubmit = useCallback((metadata: ReferenceMetadata) => {
    const formatted = formatReference(metadata);
    setLastResult(formatted);
    setMode('auto');
  }, []);

  const handleAddToList = useCallback((ref: FormattedReference) => {
    addReference(ref);
  }, [addReference]);

  const handleDetect = useCallback((value: string) => {
    detect(value);
  }, [detect]);

  return (
    <>
      <header className="topbar">
        <a href="/" className="logo">
          Cita<span className="logo-dot">.</span>sh
        </a>
        <nav className="nav">
          <button className="nav-link" onClick={() => setMode('auto')}>formatar</button>
          <button className="nav-link">guias</button>
          <button className="nav-link nav-pro">pro</button>
        </nav>
      </header>

      <section className="hero">
        <h1 className="hero-title">
          Nunca mais erre
          <br />
          uma referência.
          <span className="hero-annotation">
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none" style={{ verticalAlign: 'middle', marginRight: 2 }}>
              <path d="M2 14 C5 6, 8 2, 18 2" stroke="#93032E" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <path d="M14 0 L18 2 L14 5" stroke="#93032E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            funciona mesmo!
          </span>
        </h1>
        <ScribbleUnderline width={240} />
        <p className="hero-sub">Cole o DOI, ISBN ou URL. Receba ABNT perfeita.</p>
      </section>

      <main className="main">
        {mode === 'auto' ? (
          <InputArea
            onSubmit={handleAutoSubmit}
            onDetect={handleDetect}
            detectedType={detectedType}
            loading={loading}
            onManualClick={() => setMode('manual')}
          />
        ) : (
          <ManualForm
            onSubmit={handleManualSubmit}
            onCancel={() => setMode('auto')}
          />
        )}

        {error && <div className="error-msg">{error}</div>}

        {lastResult && (
          <ResultCard
            reference={lastResult}
            onAddToList={handleAddToList}
            listIsFull={isFull}
          />
        )}

        <ReferenceList
          references={references}
          onRemove={removeReference}
          onClear={clearAll}
        />
      </main>

      <footer className="footer">
        <p className="footer-text">ABNT NBR 6023:2018</p>
        <p className="footer-hand">feito com precisão, não com IA</p>
      </footer>
    </>
  );
}
