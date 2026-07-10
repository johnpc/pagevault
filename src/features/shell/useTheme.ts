import { useState, useCallback } from 'react';
import { readTheme, applyTheme, type ThemeChoice } from './theme';

/**
 * The current theme choice + a setter that applies it (updates <html> +
 * localStorage) and re-renders. Reads the persisted choice on mount.
 */
export function useTheme(): [ThemeChoice, (choice: ThemeChoice) => void] {
  const [choice, setChoice] = useState<ThemeChoice>(readTheme);

  const choose = useCallback((next: ThemeChoice) => {
    applyTheme(next);
    setChoice(next);
  }, []);

  return [choice, choose];
}
