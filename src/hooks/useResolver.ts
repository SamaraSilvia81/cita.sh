import { useState, useCallback } from 'react';
import type { ReferenceMetadata, InputType } from '../engine/types';
import { detectInput } from '../engine/utils/detect-input';
import { resolveFromDOI } from '../engine/resolvers/crossref';
import { resolveFromISBN } from '../engine/resolvers/openlibrary';

interface ResolverState {
  loading: boolean;
  error: string | null;
  detectedType: InputType | null;
}

export function useResolver() {
  const [state, setState] = useState<ResolverState>({
    loading: false,
    error: null,
    detectedType: null,
  });

  const detect = useCallback((input: string) => {
    if (!input.trim()) {
      setState({ loading: false, error: null, detectedType: null });
      return null;
    }
    const detected = detectInput(input);
    setState(prev => ({ ...prev, detectedType: detected.type, error: null }));
    return detected;
  }, []);

  const resolve = useCallback(async (input: string): Promise<ReferenceMetadata | null> => {
    const detected = detectInput(input);

    if (detected.type === 'manual') {
      return null; // Manual entry, no API resolution
    }

    setState({ loading: true, error: null, detectedType: detected.type });

    try {
      let metadata: ReferenceMetadata;

      switch (detected.type) {
        case 'doi':
          metadata = await resolveFromDOI(detected.normalized);
          break;
        case 'isbn':
          metadata = await resolveFromISBN(detected.normalized);
          break;
        case 'url':
          // URL resolver needs CORS proxy - fallback to manual for MVP
          setState({
            loading: false,
            error: 'Resolução de URL em breve. Use entrada manual para sites.',
            detectedType: 'url',
          });
          return null;
        default:
          return null;
      }

      setState({ loading: false, error: null, detectedType: detected.type });
      return metadata;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao resolver referência';
      setState({ loading: false, error: message, detectedType: detected.type });
      return null;
    }
  }, []);

  return {
    ...state,
    detect,
    resolve,
    clearError: () => setState(prev => ({ ...prev, error: null })),
  };
}
