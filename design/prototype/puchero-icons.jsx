// puchero-icons.jsx — line icons (Lucide style, stroke 1.75, rounded caps)
// Usage: <Icon name="refresh" size={22} color="var(--clay-600)" />

const ICON_PATHS = {
  // Services
  utensils: <g><path d="M4 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3"/><path d="M6 12v9"/><path d="M16 3a3 3 0 0 0-3 3v5h3"/><path d="M16 3v18"/></g>,
  moon: <path d="M20 14.5A8 8 0 1 1 10 4.2a6.5 6.5 0 0 0 10 10.3Z"/>,
  // Actions
  refresh: <g><path d="M3 11a8 8 0 0 1 13.7-5.3L20 9"/><path d="M20 4v5h-5"/><path d="M21 13a8 8 0 0 1-13.7 5.3L4 15"/><path d="M4 20v-5h5"/></g>,
  plus: <g><path d="M12 5v14"/><path d="M5 12h14"/></g>,
  check: <path d="M5 12.5 10 17.5 19 7"/>,
  x: <g><path d="M6 6l12 12"/><path d="M18 6 6 18"/></g>,
  chevronRight: <path d="M9 5l7 7-7 7"/>,
  chevronLeft: <path d="M15 5l-7 7 7 7"/>,
  search: <g><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></g>,
  edit: <g><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></g>,
  more: <g><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></g>,
  logout: <g><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></g>,
  // Navigation
  week: <g><rect x="3" y="4" width="18" height="17" rx="2.5"/><path d="M3 9h18"/><path d="M8 2v4"/><path d="M16 2v4"/></g>,
  meals: <g><path d="M4 4h13"/><path d="M4 12h16"/><path d="M4 20h10"/></g>,
  calendar: <g><rect x="3" y="4" width="18" height="17" rx="2.5"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 9h18"/><circle cx="8.5" cy="14" r="0.6" fill="currentColor" stroke="none"/><circle cx="12" cy="14" r="0.6" fill="currentColor" stroke="none"/><circle cx="15.5" cy="14" r="0.6" fill="currentColor" stroke="none"/></g>,
  // Status / misc
  users: <g><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 20v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1A4 4 0 0 1 16 11"/></g>,
  user: <g><circle cx="12" cy="8" r="4.2"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></g>,
  eyeOff: <g><path d="M9.9 5.2A9.5 9.5 0 0 1 12 5c5.5 0 9 5.5 9 7a11 11 0 0 1-2.3 3"/><path d="M6.3 7.3A12 12 0 0 0 3 12c0 1.5 3.5 7 9 7a9 9 0 0 0 4.2-1"/><path d="M3 3l18 18"/><path d="M9.8 9.9a3 3 0 0 0 4.2 4.2"/></g>,
  eye: <g><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></g>,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/>,
  heart: <path d="M12 20s-7-4.6-9-9C1.5 7.5 3.5 4.5 7 4.5c2 0 3.4 1.2 5 3 1.6-1.8 3-3 5-3 3.5 0 5.5 3 4 6.5-2 4.4-9 9-9 9Z"/>,
};

function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 1.75, style = {} }) {
  const p = ICON_PATHS[name];
  if (!p) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0, ...style }}>
      {p}
    </svg>
  );
}

// ── The puchero / clay pot (brand motif) ───────────────
// steam: shows animated steam
function PucheroPot({ size = 96, color = 'var(--clay-600)', steam = false, strokeWidth = 1.75 }) {
  const sw = strokeWidth;
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" style={{ display: 'block', overflow: 'visible' }}>
      {steam && (
        <g stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" opacity="0.55">
          <path className="pot-steam pot-steam-1" d="M36 30c-3-4 3-7 0-11s3-7 0-11" />
          <path className="pot-steam pot-steam-2" d="M48 28c-3-4.5 3-7.5 0-12s3-7.5 0-12" />
          <path className="pot-steam pot-steam-3" d="M60 30c-3-4 3-7 0-11s3-7 0-11" />
        </g>
      )}
      {/* lid */}
      <path d="M28 40c0-2 9-4 20-4s20 2 20 4" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1="48" y1="31" x2="48" y2="36" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <circle cx="48" cy="30" r="2.6" fill={color} />
      {/* pot body */}
      <path d="M26 44h44l-3.5 22a8 8 0 0 1-7.9 6.8H37.4A8 8 0 0 1 29.5 66Z"
        stroke={color} strokeWidth={sw} strokeLinejoin="round" />
      {/* handles */}
      <path d="M26 47c-5 0-7 3-7 6s2 5 4 5" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <path d="M70 47c5 0 7 3 7 6s-2 5-4 5" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

Object.assign(window, { Icon, PucheroPot });
