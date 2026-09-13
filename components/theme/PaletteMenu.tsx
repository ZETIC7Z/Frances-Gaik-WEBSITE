'use client';

import { useEffect, useRef, useState } from 'react';
import { themes } from '@/config/themes';
import { Palette } from '@/components/ui/icons';
import { useTheme } from './ThemeProvider';

/**
 * The swatch row: one button per palette, the active one lit and named. Shared
 * by the header's theme control and the phone navigation's theme sheet, so one
 * palette choice looks and behaves the same wherever it is made.
 */
export function PaletteSwatches({ id }: { id?: string }) {
  const { themeId, setTheme } = useTheme();
  const active = themes.find((t) => t.id === themeId)?.name ?? themes[0].name;

  return (
    <div className="palette" id={id}>
      <div className="palette__head">
        <span className="palette__title">Theme</span>
        <span className="palette__name">{active}</span>
      </div>
      <div className="palette__row" role="listbox" aria-label="Colour theme">
        {themes.map((t) => (
          <button
            key={t.id}
            type="button"
            role="option"
            aria-selected={t.id === themeId}
            aria-label={t.name}
            title={t.name}
            className={`palette__swatch${t.id === themeId ? ' palette__swatch--active' : ''}`}
            onClick={() => setTheme(t.id)}
          >
            {t.swatch.map((c) => (
              <i key={c} style={{ background: c }} aria-hidden />
            ))}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * The header's theme control — the place the light/dark switch used to sit. One
 * icon button that opens the palette row in a popover beneath it, so the header
 * still carries exactly one loud call to action ("Get the Book") beside it.
 * The phone navigation owns the same control inside its pill, so this button is
 * only ever shown at desktop widths.
 */
export default function PaletteMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { themeId } = useTheme();
  const active = themes.find((t) => t.id === themeId)?.name ?? themes[0].name;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="pmenu" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`icon-btn pmenu__btn${open ? ' pmenu__btn--open' : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="palette-menu"
        aria-label={`Colour theme — ${active}`}
        title="Colour theme"
        onClick={() => setOpen((o) => !o)}
      >
        <Palette size={18} />
      </button>
      {open && (
        <div id="palette-menu" className="pmenu__panel" role="dialog" aria-label="Colour theme">
          <PaletteSwatches />
        </div>
      )}
    </div>
  );
}
