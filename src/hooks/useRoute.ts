import { useState, useEffect, useCallback } from 'react';

/**
 * Mini router client-side, sem dependências externas.
 * Sincroniza com a URL real (History API) — /manual é uma rota de verdade,
 * então o botão "voltar" do navegador funciona e a página pode ser
 * compartilhada/recarregada direto em /manual.
 */
export function useRoute() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to: string) => {
    if (to !== window.location.pathname) {
      window.history.pushState({}, '', to);
      setPath(to);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return { path, navigate };
}
