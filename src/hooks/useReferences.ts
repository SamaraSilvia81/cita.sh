import { useState, useEffect, useCallback } from 'react';
import type { FormattedReference } from '../engine/types';
import { sortReferences } from '../engine/formatter';

const STORAGE_KEY = 'cita-sh-refs';
const MAX_FREE_REFS = 20;

function loadFromStorage(): FormattedReference[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage(refs: FormattedReference[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(refs));
  } catch {
    // localStorage full or unavailable
  }
}

export function useReferences() {
  const [references, setReferences] = useState<FormattedReference[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(references);
  }, [references]);

  const addReference = useCallback((ref: FormattedReference) => {
    setReferences(prev => {
      if (prev.length >= MAX_FREE_REFS) return prev;
      const updated = [...prev, ref];
      return sortReferences(updated);
    });
  }, []);

  const removeReference = useCallback((id: string) => {
    setReferences(prev => prev.filter(r => r.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setReferences([]);
  }, []);

  return {
    references,
    addReference,
    removeReference,
    clearAll,
    count: references.length,
    isFull: references.length >= MAX_FREE_REFS,
  };
}
