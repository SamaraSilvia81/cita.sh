import { useState, useCallback, useEffect } from 'react';
import { ScribbleUnderline } from './components/HandDrawn';
import { InputArea } from './components/InputArea';
import { ManualForm } from './components/ManualForm';
import { ResultCard } from './components/ResultCard';
import { ReferenceList } from './components/ReferenceList';
import { useReferences } from './hooks/useReferences';
import { useResolver } from './hooks/useResolver';
import { useRoute } from './hooks/useRoute';
import { formatReference } from './engine/formatter';
import type { ReferenceMetadata, FormattedReference } from './engine/types';
import './styles/global.css';

export default function App() {
  const { path, navigate } = useRoute();
  const mode = path === '/manual' ? 'manual' : 'auto';
  const [lastResult, setLastResult] = useState<FormattedReference | null>(null);
  const { references, addReference, removeReference, clearAll, isFull } = useReferences();
  const { loading, error, detectedType, detect, resolve, clearError } = useResolver();

  // Se o usuário recarrega em /manual mas a rota some (ex: build estático sem
  // rewrite no servidor), garante fallback silencioso pra home na primeira carga.
  useEffect(() => {
    if (path !== '/' && path !== '/manual') navigate('/');
  }, [path, navigate]);

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
    navigate('/');
  }, [navigate]);

  const handleAddToList = useCallback((ref: FormattedReference) => {
    addReference(ref);
  }, [addReference]);

  const handleDetect = useCallback((value: string) => {
    detect(value);
  }, [detect]);

  return (
    <>
      <div className="stage">
        <div className="blob blob-1" aria-hidden="true" />
        <div className="blob blob-2" aria-hidden="true" />

        <header className="topbar">
          <a href="/" className="logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            Cita<span className="logo-dot">.</span>sh
          </a>
          <nav className="nav">
            <button className="nav-link" onClick={() => navigate('/')}>formatar</button>
            <button className="nav-link">guias</button>
            <button className="nav-link nav-pro">pro</button>
          </nav>
        </header>

        {mode === 'auto' && (
          <>
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

              <ul className="feature-strip">
                <li>dados reais via API</li>
                <li>sem IA inventando referência</li>
                <li>exporta BibTeX &amp; RIS</li>
              </ul>
            </section>

            <main className="main">
              <InputArea
                onSubmit={handleAutoSubmit}
                onDetect={handleDetect}
                detectedType={detectedType}
                loading={loading}
                onManualClick={() => navigate('/manual')}
              />

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
          </>
        )}

        {mode === 'manual' && (
          <main className="main main-manual">
            <div className="section-nav">
              <button className="back-link" onClick={() => navigate('/')}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 2 L3 7 L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                voltar
              </button>
              <span className="section-nav-title">entrada manual</span>
            </div>

            <ManualForm onSubmit={handleManualSubmit} />
          </main>
        )}
      </div>

      <footer className="footer">
        <p className="footer-text">ABNT NBR 6023:2018</p>
        <span className="footer-sep">·</span>
        <p className="footer-hand">feito com precisão, não com IA</p>
      </footer>
    </>
  );
}
