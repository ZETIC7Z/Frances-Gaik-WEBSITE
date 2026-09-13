/**
 * PROFESSIONAL THEME CATALOG
 * ---------------------------------------------------------------------------
 * Thirteen curated color families. Every palette is a dark palette — the site
 * has a single mode, so a palette is the whole choice: pick one and the page
 * (text, glass, buttons, particles, 3D book, ambient light) recolours together.
 * Default: Teal Ember (the author brand palette).
 * Names describe the color combination — no entertainment-brand references.
 */

export type ThemeTokens = {
  bg: string;
  bgSoft: string;
  surface: string;
  surfaceSoft: string;
  border: string;
  borderStrong: string;
  fg: string;
  fgSoft: string;
  fgMuted: string;
  primary: string;
  primarySoft: string;
  primaryGlow: string;
  secondary: string;
  secondaryGlow: string;
  onPrimary: string;
  onSecondary: string;
};

export type ThemeDefinition = {
  id: string;
  name: string;
  swatch: [string, string, string];
  tokens: ThemeTokens;
  /**
   * How strongly this palette's accents are allowed to glow *over the ambient
   * film*, as a multiplier on the aurora lobes, the drifting orbs and the wash.
   *
   * The film is a photograph, and the layers above it are light in the
   * palette's own colors. A palette whose accents sit in the scene's own hue
   * range (Teal Ember: teal and ember over green-brown water) can carry the
   * full amount — the light reads as part of the picture. A palette whose
   * accents are pale or cool (Glacier Steel, Sandstone Ink, Plum Radiance)
   * stacks light that the photograph cannot absorb, and the backdrop turns to
   * fog: contrast drops, the scene disappears, and body copy loses its
   * separation. Those palettes get proportioned down so the film stays a clean,
   * legible backdrop and the palette still reads in the accents — headings,
   * rules, buttons, particles — where it is supposed to.
   *
   * 1 = full strength. Teal Ember is the reference and is never reduced.
   */
  ambientGlow: number;
  /**
   * How much of the palette's base color is laid over the film, as a
   * percentage. The clip is a green-brown water scene: it harmonises with the
   * teal and forest families as-is, but a scarlet or fire palette sitting on
   * green water reads as two unrelated pictures. Raising the veil settles the
   * scene into that palette's own darkness so the accents look like light
   * *inside* the image instead of paint on top of it. The default is 5.
   */
  filmVeil?: number;
};

const tealEmber: ThemeDefinition = {
  id: 'teal-ember',
  name: 'Teal Ember',
  swatch: ['#081B1B', '#00A896', '#F5A623'],
  ambientGlow: 1,
  filmVeil: 5,
  tokens: {
    bg: '#081B1B',
    bgSoft: '#0C0E10',
    surface: '#0C2423',
    surfaceSoft: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(0,168,150,0.35)',
    fg: '#EDF7F4',
    fgSoft: '#C6D9D5',
    fgMuted: '#92AAA6',
    primary: '#00A896',
    primarySoft: 'rgba(0,168,150,0.12)',
    primaryGlow: 'rgba(0,168,150,0.45)',
    secondary: '#F5A623',
    secondaryGlow: 'rgba(245,166,35,0.45)',
    onPrimary: '#03211E',
    onSecondary: '#231602',
  },
};

const graphiteRose: ThemeDefinition = {
  id: 'graphite-rose',
  name: 'Graphite Rose',
  swatch: ['#16161A', '#E56B8C', '#F4B8C8'],
  ambientGlow: 0.55,
  filmVeil: 9,
  tokens: {
    bg: '#16161A',
    bgSoft: '#0D0D10',
    surface: '#22222A',
    surfaceSoft: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(229,107,140,0.38)',
    fg: '#F7EFF2',
    fgSoft: '#E4D2D9',
    fgMuted: '#B2A0A8',
    primary: '#E56B8C',
    primarySoft: 'rgba(229,107,140,0.12)',
    primaryGlow: 'rgba(229,107,140,0.45)',
    secondary: '#F4B8C8',
    secondaryGlow: 'rgba(244,184,200,0.40)',
    onPrimary: '#2E0A15',
    onSecondary: '#331018',
  },
};

const scarletNoir: ThemeDefinition = {
  id: 'scarlet-noir',
  name: 'Scarlet Noir',
  swatch: ['#0C0508', '#E50914', '#FF8A6B'],
  // Pure saturated red over green water: the veil does most of the work, the
  // glow stays moderate so the river's highlights do not turn pink.
  ambientGlow: 0.72,
  filmVeil: 20,
  tokens: {
    bg: '#0C0508',
    bgSoft: '#070304',
    surface: '#1B0A0E',
    surfaceSoft: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(229,9,20,0.42)',
    fg: '#FBEDEE',
    fgSoft: '#E7C9CC',
    fgMuted: '#B08A8E',
    primary: '#E50914',
    primarySoft: 'rgba(229,9,20,0.14)',
    primaryGlow: 'rgba(229,9,20,0.45)',
    secondary: '#FF8A6B',
    secondaryGlow: 'rgba(255,138,107,0.40)',
    onPrimary: '#FFFFFF',
    onSecondary: '#2B0A02',
  },
};

const infernoEmber: ThemeDefinition = {
  id: 'inferno-ember',
  name: 'Inferno Ember',
  swatch: ['#150605', '#FF4D1C', '#FFB03A'],
  ambientGlow: 0.85,
  filmVeil: 22,
  tokens: {
    bg: '#150605',
    bgSoft: '#0C0303',
    surface: '#26100C',
    surfaceSoft: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(255,77,28,0.42)',
    fg: '#FCEFE6',
    fgSoft: '#EFCDBA',
    fgMuted: '#BD9179',
    primary: '#FF4D1C',
    primarySoft: 'rgba(255,77,28,0.14)',
    primaryGlow: 'rgba(255,77,28,0.50)',
    secondary: '#FFB03A',
    secondaryGlow: 'rgba(255,176,58,0.45)',
    onPrimary: '#2A0A00',
    onSecondary: '#2E1A00',
  },
};

const bumblebeeNoir: ThemeDefinition = {
  id: 'bumblebee-noir',
  name: 'Bumblebee Noir',
  swatch: ['#0D0C07', '#F5C518', '#FFE873'],
  // Gold on warm black: high contrast, but both stops are pale, so the glow is
  // eased the way the other light-accent palettes are.
  ambientGlow: 0.7,
  filmVeil: 16,
  tokens: {
    bg: '#0D0C07',
    bgSoft: '#080705',
    surface: '#1B1810',
    surfaceSoft: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(245,197,24,0.42)',
    fg: '#FBF7E8',
    fgSoft: '#E5DCC0',
    fgMuted: '#ABA188',
    primary: '#F5C518',
    primarySoft: 'rgba(245,197,24,0.14)',
    primaryGlow: 'rgba(245,197,24,0.48)',
    secondary: '#FFE873',
    secondaryGlow: 'rgba(255,232,115,0.40)',
    onPrimary: '#241D00',
    onSecondary: '#2A2400',
  },
};

const cobaltAurora: ThemeDefinition = {
  id: 'cobalt-aurora',
  name: 'Cobalt Aurora',
  swatch: ['#0A1128', '#3E6FF4', '#9D6BFF'],
  // Deep blue and violet over a green-brown scene flatten it fastest.
  ambientGlow: 0.5,
  filmVeil: 12,
  tokens: {
    bg: '#0A1128',
    bgSoft: '#0B0E1A',
    surface: '#111A3C',
    surfaceSoft: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(62,111,244,0.40)',
    fg: '#EAF0FF',
    fgSoft: '#C9D6F5',
    fgMuted: '#8FA0C9',
    primary: '#3E6FF4',
    primarySoft: 'rgba(62,111,244,0.12)',
    primaryGlow: 'rgba(62,111,244,0.45)',
    secondary: '#9D6BFF',
    secondaryGlow: 'rgba(157,107,255,0.45)',
    onPrimary: '#060D2E',
    onSecondary: '#0D0630',
  },
};

const oceanMist: ThemeDefinition = {
  id: 'ocean-mist',
  name: 'Ocean Mist',
  swatch: ['#06212E', '#19B8C4', '#BEE9EF'],
  // The secondary is near-white: at full strength it veils the scene.
  ambientGlow: 0.55,
  filmVeil: 7,
  tokens: {
    bg: '#06212E',
    bgSoft: '#081018',
    surface: '#0B3140',
    surfaceSoft: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(25,184,196,0.40)',
    fg: '#EAF7F9',
    fgSoft: '#C4E2E8',
    fgMuted: '#8FB4BC',
    primary: '#19B8C4',
    primarySoft: 'rgba(25,184,196,0.12)',
    primaryGlow: 'rgba(25,184,196,0.45)',
    secondary: '#8FD8E8',
    secondaryGlow: 'rgba(143,216,232,0.40)',
    onPrimary: '#02262C',
    onSecondary: '#04262C',
  },
};

const plumRadiance: ThemeDefinition = {
  id: 'plum-radiance',
  name: 'Plum Radiance',
  swatch: ['#1B0E26', '#B86EE8', '#F49AC8'],
  ambientGlow: 0.55,
  filmVeil: 13,
  tokens: {
    bg: '#1B0E26',
    bgSoft: '#100816',
    surface: '#2A1740',
    surfaceSoft: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(184,110,232,0.40)',
    fg: '#F8EFFD',
    fgSoft: '#E2CFEE',
    fgMuted: '#B39CC4',
    primary: '#B86EE8',
    primarySoft: 'rgba(184,110,232,0.12)',
    primaryGlow: 'rgba(184,110,232,0.45)',
    secondary: '#F49AC8',
    secondaryGlow: 'rgba(244,154,200,0.40)',
    onPrimary: '#1B0A2B',
    onSecondary: '#2E0F20',
  },
};

const forestCopper: ThemeDefinition = {
  id: 'forest-copper',
  name: 'Forest Copper',
  swatch: ['#0D1F14', '#2FA36B', '#C97E3D'],
  // Green and copper are the film's own family, so this one barely needs easing.
  ambientGlow: 0.85,
  filmVeil: 6,
  tokens: {
    bg: '#0D1F14',
    bgSoft: '#0A1210',
    surface: '#153425',
    surfaceSoft: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(47,163,107,0.40)',
    fg: '#EFF8F1',
    fgSoft: '#CFE4D5',
    fgMuted: '#9BB6A3',
    primary: '#2FA36B',
    primarySoft: 'rgba(47,163,107,0.12)',
    primaryGlow: 'rgba(47,163,107,0.45)',
    secondary: '#C97E3D',
    secondaryGlow: 'rgba(201,126,61,0.45)',
    onPrimary: '#04220F',
    onSecondary: '#251203',
  },
};

const solarSlate: ThemeDefinition = {
  id: 'solar-slate',
  name: 'Solar Slate',
  swatch: ['#20242C', '#F0A63C', '#FFE08A'],
  ambientGlow: 0.85,
  filmVeil: 10,
  tokens: {
    bg: '#20242C',
    bgSoft: '#12151A',
    surface: '#2B3140',
    surfaceSoft: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(240,166,60,0.40)',
    fg: '#F8F5EE',
    fgSoft: '#E3DECF',
    fgMuted: '#B0AB9C',
    primary: '#F0A63C',
    primarySoft: 'rgba(240,166,60,0.12)',
    primaryGlow: 'rgba(240,166,60,0.45)',
    secondary: '#FFE08A',
    secondaryGlow: 'rgba(255,224,138,0.40)',
    onPrimary: '#2E1D03',
    onSecondary: '#33260A',
  },
};

const glacierSteel: ThemeDefinition = {
  id: 'glacier-steel',
  name: 'Glacier Steel',
  swatch: ['#101826', '#6FA8DC', '#DCEBF7'],
  // Both accents are pale and cool: the most fog-prone pair in the catalog.
  ambientGlow: 0.5,
  filmVeil: 12,
  tokens: {
    bg: '#101826',
    bgSoft: '#0A0F18',
    surface: '#1A2740',
    surfaceSoft: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(111,168,220,0.40)',
    fg: '#F1F7FC',
    fgSoft: '#D2E2F0',
    fgMuted: '#9CB0C4',
    primary: '#6FA8DC',
    primarySoft: 'rgba(111,168,220,0.12)',
    primaryGlow: 'rgba(111,168,220,0.45)',
    secondary: '#B8CFE5',
    secondaryGlow: 'rgba(184,207,229,0.40)',
    onPrimary: '#0B1B2E',
    onSecondary: '#12222F',
  },
};

const indigoMineral: ThemeDefinition = {
  id: 'indigo-mineral',
  name: 'Indigo Mineral',
  swatch: ['#101B3A', '#4FD1C5', '#9F7AEA'],
  ambientGlow: 0.65,
  filmVeil: 12,
  tokens: {
    bg: '#101B3A',
    bgSoft: '#0A0F22',
    surface: '#18264E',
    surfaceSoft: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(79,209,197,0.40)',
    fg: '#EEF6FC',
    fgSoft: '#CFE0EE',
    fgMuted: '#9AAAC4',
    primary: '#4FD1C5',
    primarySoft: 'rgba(79,209,197,0.12)',
    primaryGlow: 'rgba(79,209,197,0.45)',
    secondary: '#9F7AEA',
    secondaryGlow: 'rgba(159,122,234,0.45)',
    onPrimary: '#04262B',
    onSecondary: '#170A33',
  },
};

const sandstoneInk: ThemeDefinition = {
  id: 'sandstone-ink',
  name: 'Sandstone Ink',
  swatch: ['#14110D', '#D9B98A', '#F2E3C8'],
  // Warm accents, but near-white ones — eased so the film keeps its depth.
  ambientGlow: 0.75,
  filmVeil: 8,
  tokens: {
    bg: '#14110D',
    bgSoft: '#0C0A08',
    surface: '#221D16',
    surfaceSoft: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(217,185,138,0.40)',
    fg: '#F7F2E9',
    fgSoft: '#E4DCCB',
    fgMuted: '#B2A895',
    primary: '#D9B98A',
    primarySoft: 'rgba(217,185,138,0.12)',
    primaryGlow: 'rgba(217,185,138,0.45)',
    secondary: '#F2E3C8',
    secondaryGlow: 'rgba(242,227,200,0.40)',
    onPrimary: '#241B0D',
    onSecondary: '#2A2113',
  },
};

/**
 * The catalog, in the order it is offered. Teal Ember is the brand default and
 * stays first (it is the palette the server-rendered HTML paints); Graphite
 * Rose is the second option because it is the most-requested alternative.
 */
export const themes: ThemeDefinition[] = [
  tealEmber,
  graphiteRose,
  scarletNoir,
  infernoEmber,
  bumblebeeNoir,
  solarSlate,
  forestCopper,
  cobaltAurora,
  oceanMist,
  plumRadiance,
  glacierSteel,
  indigoMineral,
  sandstoneInk,
];

export const defaultThemeId = 'teal-ember';

/** Every palette's film veil, as a CSS-ready percentage string. */
export const defaultFilmVeil = '5%';
