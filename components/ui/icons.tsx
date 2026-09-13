type P = { size?: number; className?: string };

const base = (size = 20) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
});

export const Sun = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3 7 7M17 17l1.7 1.7M18.7 5.3 17 7M7 17l-1.7 1.7" />
  </svg>
);

export const Moon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z" />
  </svg>
);

export const Palette = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 0 0 0 18c1.2 0 2-.9 2-2 0-.6-.3-1-.6-1.4-.3-.4-.6-.8-.6-1.4 0-1.1.9-2 2-2h2.2A5 5 0 0 0 21 10c0-3.9-4-7-9-7Z" />
  </svg>
);

export const Menu = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const Close = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const Phone = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M5 4h4l1.5 4L8 9.8a12.5 12.5 0 0 0 6.2 6.2l1.8-2.5 4 1.5v4a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3 6.2 2 2 0 0 1 5 4Z" />
  </svg>
);

export const Mail = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

export const MapPin = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 21s-6.5-5.3-6.5-10.2A6.5 6.5 0 0 1 12 4.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15.7 12 21 12 21Z" />
    <circle cx="12" cy="10.8" r="2.3" />
  </svg>
);

export const Book = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 6.5C10.2 5 7.8 4.5 4.5 4.5v13c3.3 0 5.7.5 7.5 2 1.8-1.5 4.2-2 7.5-2v-13c-3.3 0-5.7.5-7.5 2Z" />
    <path d="M12 6.5v13" />
  </svg>
);

export const Star = ({ size, className }: P) => (
  <svg {...base(size)} className={className} fill="currentColor" stroke="none">
    <path d="m12 3.6 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8L12 3.6Z" />
  </svg>
);

export const ArrowRight = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 12h16m-6-6 6 6-6 6" />
  </svg>
);

export const Leaf = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M5 19c0-8 5-13 14-14 1 9-3.5 14-11 14H5Z" />
    <path d="M5 19c3-5 7-8 11-9.5" />
  </svg>
);

export const Sparkle = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 4v5M12 15v5M4 12h5M15 12h5M6.5 6.5l2.8 2.8M14.7 14.7l2.8 2.8M17.5 6.5l-2.8 2.8M9.3 14.7l-2.8 2.8" />
  </svg>
);

export const Home = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-8.5Z" />
    <path d="M9.6 20.5v-6h4.8v6" />
  </svg>
);

export const User = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="8.4" r="3.6" />
    <path d="M4.8 20.2a7.4 7.4 0 0 1 14.4 0" />
  </svg>
);

export const ChevronUp = ({ size, className }: P) => (
  <svg {...base(size)} className={className} strokeWidth={2.2}>
    <path d="m6 14.5 6-6 6 6" />
  </svg>
);

export const Dots = ({ size, className }: P) => (
  <svg {...base(size)} className={className} strokeWidth={2.6}>
    <path d="M5 12h.01M12 12h.01M19 12h.01" />
  </svg>
);

export const Shield = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3 5 6v5.5c0 4.6 3 7.9 7 9.5 4-1.6 7-4.9 7-9.5V6l-7-3Z" />
    <path d="m9.2 12 2 2 3.6-4" />
  </svg>
);
