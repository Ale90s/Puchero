// puchero-ui.jsx — Puchero base component library
// Requires: Icon (puchero-icons.jsx)

const STATUS_H = 54; // height to clear the iOS frame status bar / island
const NAV_H = 84;    // bottom nav bar height

// ── Button ──────────────────────────────────────────────────
function Button({ children, variant = 'primary', size = 'md', icon, loading, disabled, full, onClick, style = {} }) {
  const base = {
    fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 16,
    borderRadius: 'var(--r-btn)', border: '1px solid transparent',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    cursor: disabled || loading ? 'default' : 'pointer',
    transition: 'all .15s ease', width: full ? '100%' : 'auto',
    minHeight: size === 'lg' ? 54 : 48, padding: size === 'lg' ? '0 24px' : '0 20px',
    opacity: disabled ? 0.5 : 1, WebkitTapHighlightColor: 'transparent', userSelect: 'none',
    whiteSpace: 'nowrap',
    ...style,
  };
  const variants = {
    primary:   { background: 'var(--clay-600)', color: 'var(--text-on-clay)' },
    secondary: { background: 'transparent', color: 'var(--sage-700)', borderColor: 'var(--sage-500)' },
    tertiary:  { background: 'transparent', color: 'var(--clay-600)', minHeight: 44, padding: '0 8px' },
  };
  const [hover, setHover] = React.useState(false);
  const hoverBg = {
    primary: { background: 'var(--clay-700)' },
    secondary: { background: 'var(--sage-100)' },
    tertiary: { background: 'var(--cream-200)' },
  };
  return (
    <button onClick={disabled || loading ? undefined : onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ ...base, ...variants[variant], ...(hover && !disabled && !loading ? hoverBg[variant] : {}) }}>
      {loading
        ? <span className="p-spin" style={{ width: 20, height: 20, borderRadius: '50%',
            border: '2.5px solid rgba(253,251,246,.4)', borderTopColor: 'var(--text-on-clay)' }} />
        : (<>{icon && <Icon name={icon} size={20} color="currentColor" />}<span>{children}</span></>)}
    </button>
  );
}

// ── Circular icon button (re-roll) ─────────────────────────────
function IconButton({ name, onClick, size = 44, bg = 'var(--clay-100)', color = 'var(--clay-600)', spinning, title, style = {} }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick} title={title} aria-label={title}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ width: size, height: size, borderRadius: '50%', border: 'none',
        background: hover ? 'var(--clay-300)' : bg, color, display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        transition: 'background .15s ease', flexShrink: 0, WebkitTapHighlightColor: 'transparent', ...style }}>
      <span className={spinning ? 'p-spin-el' : ''} style={{ display: 'flex' }}>
        <Icon name={name} size={size >= 44 ? 22 : 18} color={hover ? '#fff' : color} />
      </span>
    </button>
  );
}

// ── Card ───────────────────────────────────────────────────
function Card({ children, style = {}, accent, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--cream-50)', borderRadius: 'var(--r-card)',
      boxShadow: 'var(--shadow-card)', padding: 16,
      border: accent ? '1.5px solid var(--saffron-500)' : '1px solid var(--cream-300)',
      ...style }}>
      {children}
    </div>
  );
}

// ── Chip / pill ────────────────────────────────────────────
function Chip({ children, tone = 'clay', icon, size = 'md', style = {} }) {
  const tones = {
    clay:    { bg: 'var(--clay-100)', fg: 'var(--clay-700)' },
    sage:    { bg: 'var(--sage-100)', fg: 'var(--sage-700)' },
    saffron: { bg: 'var(--saffron-100)', fg: 'var(--saffron-600)' },
    cream:   { bg: 'var(--cream-200)', fg: 'var(--text-secondary)' },
  };
  const t = tones[tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
      background: t.bg, color: t.fg, borderRadius: 'var(--r-pill)',
      padding: size === 'sm' ? '3px 9px' : '5px 12px',
      fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: size === 'sm' ? 12.5 : 13.5,
      whiteSpace: 'nowrap', ...style }}>
      {icon && <Icon name={icon} size={size === 'sm' ? 13 : 15} color="currentColor" />}
      {children}
    </span>
  );
}

// ── Avatar (initial on a soft color circle) ──────────────
const AVATAR_TONES = [
  { bg: 'var(--clay-100)',   fg: 'var(--clay-700)' },
  { bg: 'var(--sage-100)',   fg: 'var(--sage-700)' },
  { bg: 'var(--saffron-100)',fg: 'var(--saffron-600)' },
  { bg: '#E1E8EE',           fg: 'var(--info-fg)' },
  { bg: 'var(--cream-300)',  fg: 'var(--text-secondary)' },
];
function Avatar({ name, toneIndex = 0, size = 32, dimmed, ring }) {
  const t = AVATAR_TONES[toneIndex % AVATAR_TONES.length];
  return (
    <div title={name} style={{ width: size, height: size, borderRadius: '50%',
      background: dimmed ? 'var(--cream-200)' : t.bg, color: dimmed ? 'var(--text-tertiary)' : t.fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: size * 0.42,
      flexShrink: 0, border: ring ? '2px solid var(--cream-50)' : 'none',
      boxShadow: ring ? '0 0 0 1px var(--cream-300)' : 'none',
      opacity: dimmed ? 0.7 : 1, transition: 'all .15s ease',
      textDecoration: dimmed ? 'line-through' : 'none' }}>
      {name.charAt(0)}
    </div>
  );
}

// ── Toggle / switch ────────────────────────────────────────
function Toggle({ on, onChange, label }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      style={{ width: 52, height: 30, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 3,
        background: on ? 'var(--sage-500)' : 'var(--cream-400)', transition: 'background .2s ease',
        display: 'flex', alignItems: 'center', WebkitTapHighlightColor: 'transparent', flexShrink: 0 }}>
      <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 3px rgba(61,56,47,.25)', transform: on ? 'translateX(22px)' : 'translateX(0)',
        transition: 'transform .2s cubic-bezier(.2,.7,.2,1)' }} />
    </button>
  );
}

// ── Top bar ────────────────────────────────────────────────
function TopBar({ title, subtitle, trailing, scrolled }) {
  return (
    <div style={{ paddingTop: STATUS_H, background: 'var(--cream-100)',
      position: 'sticky', top: 0, zIndex: 20,
      boxShadow: scrolled ? '0 1px 0 var(--cream-300)' : 'none', transition: 'box-shadow .2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        padding: '6px 20px 12px', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {subtitle && <div className="p-meta" style={{ marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</div>}
          <h1 className="p-h1" style={{ margin: 0, fontSize: 28 }}>{title}</h1>
        </div>
        {trailing}
      </div>
    </div>
  );
}

// ── Bottom navigation bar ────────────────────────────────────
function BottomNav({ active, onNavigate }) {
  const items = [
    { id: 'week', label: 'Semana', icon: 'week' },
    { id: 'meals', label: 'Comidas', icon: 'meals' },
  ];
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40,
      background: 'var(--cream-50)', borderTop: '1px solid var(--cream-300)',
      paddingBottom: 22, height: NAV_H, display: 'flex' }}>
      {items.map(it => {
        const on = active === it.id;
        return (
          <button key={it.id} onClick={() => onNavigate(it.id)}
            style={{ flex: 1, border: 'none', background: 'transparent', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 4, paddingTop: 10, WebkitTapHighlightColor: 'transparent' }}>
            <Icon name={it.icon} size={25} color={on ? 'var(--clay-600)' : 'var(--text-tertiary)'} strokeWidth={on ? 2 : 1.75} />
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: on ? 700 : 500, fontSize: 12,
              color: on ? 'var(--clay-600)' : 'var(--text-tertiary)' }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────
function EmptyState({ title, body, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      padding: '32px 28px', gap: 8 }}>
      <div style={{ marginBottom: 8, opacity: 0.9 }}><PucheroPot size={84} color="var(--clay-300)" /></div>
      <h2 className="p-h2" style={{ margin: 0 }}>{title}</h2>
      <p className="p-body" style={{ margin: '0 0 12px', color: 'var(--text-secondary)', maxWidth: 280, textWrap: 'pretty' }}>{body}</p>
      {action}
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────
function Toast({ message, tone = 'success' }) {
  const tones = {
    success: { bg: 'var(--success-bg)', fg: 'var(--success-fg)', icon: 'check' },
    info:    { bg: 'var(--info-bg)', fg: 'var(--info-fg)', icon: 'sparkle' },
    warning: { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', icon: 'sparkle' },
  };
  const t = tones[tone];
  return (
    <div className="p-toast" style={{ position: 'absolute', left: 16, right: 16, bottom: NAV_H + 12, zIndex: 60,
      background: t.bg, color: t.fg, borderRadius: 'var(--r-btn)', padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-pop)',
      fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15 }}>
      <Icon name={t.icon} size={20} color="currentColor" />
      <span>{message}</span>
    </div>
  );
}

Object.assign(window, { Button, IconButton, Card, Chip, Avatar, Toggle, TopBar, BottomNav, EmptyState, Toast, STATUS_H, NAV_H });
