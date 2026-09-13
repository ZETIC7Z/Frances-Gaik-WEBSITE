'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { defaultFilmVeil, defaultThemeId, themes } from '@/config/themes';
import type { ThemeDefinition, ThemeTokens } from '@/config/themes';

type ThemeCtx = {
  themeId: string;
  theme: ThemeDefinition;
  tokens: ThemeTokens;
  setTheme: (id: string) => void;
  ready: boolean;
};

const Ctx = createContext<ThemeCtx | null>(null);

const THEME_KEY = 'fg-theme';

function readStoredTheme(): string {
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return themes.some((theme) => theme.id === stored) ? (stored as string) : defaultThemeId;
  } catch {
    return defaultThemeId;
  }
}

/**
 * The site has one mode — dark — so a palette is the entire choice a visitor
 * makes. This provider owns that choice: it writes the palette's tokens onto
 * <html> as custom properties (so every background, glow, card, button,
 * particle and 3D material recolours from one place) and remembers it in
 * localStorage. The server-rendered HTML already paints Teal Ember (mirrored in
 * `:root`), so a returning visitor sees the default for one frame rather than a
 * flash of unstyled colour.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState(defaultThemeId);
  const [ready, setReady] = useState(false);

  // Restore the persisted palette once on mount.
  useEffect(() => {
    setThemeId(readStoredTheme());
    setReady(true);
  }, []);

  const theme = useMemo(
    () => themes.find((entry) => entry.id === themeId) ?? themes[0],
    [themeId],
  );
  const tokens = theme.tokens;

  // Apply tokens to <html> so both client and (re)hydrated DOM stay in sync.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme.id;
    for (const [key, value] of Object.entries(tokens)) {
      root.style.setProperty(`--${key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}`, value);
    }
    // The ambient film's light layers are proportioned per palette (see
    // `ambientGlow` in `config/themes.ts`) so the backdrop reads the same on
    // every palette instead of fogging up on the pale-accent ones.
    root.style.setProperty('--ambient-glow', String(theme.ambientGlow));
    // …and the palette's own darkness is laid over the clip, so a scarlet or
    // fire palette never sits as paint on top of a green scene (`filmVeil`).
    root.style.setProperty('--film-veil', theme.filmVeil ? `${theme.filmVeil}%` : defaultFilmVeil);
    if (ready) {
      try {
        window.localStorage.setItem(THEME_KEY, theme.id);
      } catch {
        /* storage unavailable — selection stays session-only */
      }
    }
  }, [theme, tokens, ready]);

  const setTheme = useCallback((id: string) => setThemeId(id), []);

  const value = useMemo(
    () => ({ themeId, theme, tokens, setTheme, ready }),
    [themeId, theme, tokens, setTheme, ready],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
