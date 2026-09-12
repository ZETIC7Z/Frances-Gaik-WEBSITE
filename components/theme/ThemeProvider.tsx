'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { defaultMode, defaultThemeId, themes } from '@/config/themes';
import type { Mode, ThemeDefinition, ThemeTokens } from '@/config/themes';

type ThemeCtx = {
  themeId: string;
  mode: Mode;
  theme: ThemeDefinition;
  tokens: ThemeTokens;
  setTheme: (id: string) => void;
  setMode: (m: Mode) => void;
  toggleMode: () => void;
  ready: boolean;
};

const Ctx = createContext<ThemeCtx | null>(null);

const THEME_KEY = 'fg-theme';
const MODE_KEY = 'fg-mode';

function readStorage(): { themeId: string; mode: Mode } {
  try {
    const themeId = window.localStorage.getItem(THEME_KEY) || defaultThemeId;
    const storedMode = window.localStorage.getItem(MODE_KEY) as Mode | null;
    const theme = themes.find((t) => t.id === themeId) ?? themes[0];
    let mode: Mode = storedMode === 'light' || storedMode === 'dark' ? storedMode : defaultMode;
    // A stored mode must exist on the theme (all have both). Respect system preference only when nothing stored.
    if (!storedMode) {
      mode = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return { themeId: theme.id, mode };
  } catch {
    return { themeId: defaultThemeId, mode: defaultMode };
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState(defaultThemeId);
  const [mode, setModeState] = useState<Mode>(defaultMode);
  const [ready, setReady] = useState(false);

  // Restore persisted selection once on mount.
  useEffect(() => {
    const { themeId: tid, mode: m } = readStorage();
    setThemeId(tid);
    setModeState(m);
    setReady(true);
  }, []);

  const theme = useMemo(
    () => themes.find((t) => t.id === themeId) ?? themes[0],
    [themeId]
  );
  const tokens = mode === 'dark' ? theme.dark : theme.light;

  // Apply tokens to <html> so both client and (re)hydrated DOM stay in sync.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme.id;
    root.dataset.mode = mode;
    root.style.colorScheme = mode;
    for (const [key, value] of Object.entries(tokens)) {
      root.style.setProperty(`--${key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}`, value);
    }
    if (ready) {
      try {
        window.localStorage.setItem(THEME_KEY, theme.id);
        window.localStorage.setItem(MODE_KEY, mode);
      } catch {
        /* storage unavailable — selection stays session-only */
      }
    }
  }, [theme, mode, tokens, ready]);

  const setTheme = useCallback((id: string) => {
    setThemeId(id);
  }, []);
  const setMode = useCallback((m: Mode) => setModeState(m), []);
  const toggleMode = useCallback(() => setModeState((m) => (m === 'dark' ? 'light' : 'dark')), []);

  const value = useMemo(
    () => ({ themeId, mode, theme, tokens, setTheme, setMode, toggleMode, ready }),
    [themeId, mode, theme, tokens, setTheme, setMode, toggleMode, ready]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
