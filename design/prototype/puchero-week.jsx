// puchero-week.jsx — "La semana" screen + 3 day-card variations
// Requires: Icon, PucheroPot, Button, IconButton, Card, Chip, Avatar, EmptyState, TopBar, FAMILY, TODAY_INDEX

function attendanceCount(slot) { return FAMILY.length - slot.absent.length; }

// Avatars of who eats (dimmed for those away)
function EatersRow({ slot, size = 24, max = 5 }) {
  const eaters = FAMILY.filter(m => !slot.absent.includes(m.id));
  const shown = eaters.slice(0, max);
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {shown.map((m, i) => (
        <div key={m.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
          <Avatar name={m.name} toneIndex={m.tone} size={size} ring />
        </div>
      ))}
    </div>
  );
}

function ServiceMark({ service, size = 38 }) {
  const isLunch = service === 'lunch';
  return (
    <div style={{ width: size, height: size, borderRadius: 11, flexShrink: 0,
      background: isLunch ? 'var(--clay-100)' : 'var(--sage-100)',
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={isLunch ? 'utensils' : 'moon'} size={size * 0.55}
        color={isLunch ? 'var(--clay-600)' : 'var(--sage-600)'} />
    </div>
  );
}

// Dish name with re-roll animation
function DishText({ slot, rerolling, big }) {
  return (
    <span className={rerolling ? 'p-dish-rolling' : 'p-dish'}
      style={{ fontFamily: 'var(--font-body)', fontWeight: 700,
        fontSize: big ? 18 : 17, color: 'var(--text-primary)', lineHeight: 1.3, display: 'block' }}>
      {slot.dish}
    </span>
  );
}

// Small faces of who's coming (dimmed = away). Button that opens the panel.
function AttendeeFaces({ slot, onOpen }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onOpen} title="Ver quién come" aria-label="Ver quién come"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'inline-flex', alignItems: 'center', border: 'none', cursor: 'pointer',
        background: hover ? 'var(--cream-200)' : 'transparent', borderRadius: 999,
        padding: '4px 6px', marginLeft: -6, transition: 'background .15s ease', WebkitTapHighlightColor: 'transparent' }}>
      {FAMILY.map((m, i) => {
        const eats = !slot.absent.includes(m.id);
        return (
          <span key={m.id} style={{ marginLeft: i === 0 ? 0 : -7 }}>
            <Avatar name={m.name} toneIndex={m.tone} size={24} dimmed={!eats} ring />
          </span>
        );
      })}
    </button>
  );
}

// ════════════════════════════════════════════════════════════
// VARIATION A — Stacked (classic)
// ════════════════════════════════════════════════════════════
function DayCardA({ day, idx, isToday, rerolling, onReroll, onOpenAttendance }) {
  const slotRow = (service) => {
    const slot = day[service];
    const rolling = rerolling === `${idx}-${service}`;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
        <ServiceMark service={service} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="p-meta" style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.02em',
            color: service === 'lunch' ? 'var(--clay-600)' : 'var(--sage-600)', marginBottom: 1 }}>
            {service === 'lunch' ? 'COMIDA' : 'CENA'}
          </div>
          <DishText slot={slot} rerolling={rolling} big />
          <div style={{ marginTop: 6 }}>
            <AttendeeFaces slot={slot} onOpen={() => onOpenAttendance(idx, service)} />
          </div>
        </div>
        <IconButton name="refresh" size={42} spinning={rolling} title="Cambiar plato"
          onClick={() => onReroll(idx, service)} />
      </div>
    );
  };
  return (
    <Card accent={isToday} style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 2 }}>
        <h3 className="p-h2" style={{ margin: 0, fontSize: 20 }}>{day.name}</h3>
        {isToday
          ? <Chip tone="saffron" size="sm">Hoy</Chip>
          : <span className="p-meta" style={{ color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{day.date}</span>}
      </div>
      <div style={{ borderTop: '1px solid var(--cream-200)', marginTop: 6 }}>
        {slotRow('lunch')}
        <div style={{ height: 1, background: 'var(--cream-200)' }} />
        {slotRow('dinner')}
      </div>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// VARIATION B — Compact daily (day column + dense slots)
// ════════════════════════════════════════════════════════════
function DayCardB({ day, idx, isToday, rerolling, onReroll }) {
  const slotLine = (service) => {
    const slot = day[service];
    const rolling = rerolling === `${idx}-${service}`;
    const isLunch = service === 'lunch';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
        <Icon name={isLunch ? 'utensils' : 'moon'} size={18} color={isLunch ? 'var(--clay-500)' : 'var(--sage-600)'} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <DishText slot={slot} rerolling={rolling} />
          <span className="p-meta" style={{ fontSize: 12.5 }}>{attendanceCount(slot)} en casa</span>
        </div>
        <IconButton name="refresh" size={38} spinning={rolling} title="Cambiar plato"
          onClick={() => onReroll(idx, service)} />
      </div>
    );
  };
  return (
    <Card accent={isToday} style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 64, flexShrink: 0, background: isToday ? 'var(--saffron-100)' : 'var(--cream-200)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 0', gap: 2 }}>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 22,
            color: isToday ? 'var(--saffron-600)' : 'var(--text-primary)' }}>{day.short}</span>
          <span className="p-meta" style={{ fontSize: 11.5, color: isToday ? 'var(--saffron-600)' : 'var(--text-tertiary)' }}>{day.date}</span>
        </div>
        <div style={{ flex: 1, padding: '4px 14px', minWidth: 0 }}>
          {slotLine('lunch')}
          <div style={{ height: 1, background: 'var(--cream-200)' }} />
          {slotLine('dinner')}
        </div>
      </div>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// VARIATION C — Service cards (color stripe, editorial)
// ════════════════════════════════════════════════════════════
function DayCardC({ day, idx, isToday, rerolling, onReroll }) {
  const serviceCard = (service) => {
    const slot = day[service];
    const rolling = rerolling === `${idx}-${service}`;
    const isLunch = service === 'lunch';
    const stripe = isLunch ? 'var(--clay-500)' : 'var(--sage-500)';
    return (
      <div style={{ flex: 1, background: 'var(--cream-50)', borderRadius: 14, overflow: 'hidden',
        border: '1px solid var(--cream-300)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 4, background: stripe }} />
        <div style={{ padding: '12px 13px 13px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <div className="p-meta" style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.06em',
            color: stripe }}>{isLunch ? 'COMIDA' : 'CENA'}</div>
          <div style={{ flex: 1 }}><DishText slot={slot} rerolling={rolling} big /></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
            <EatersRow slot={slot} size={22} max={4} />
            <IconButton name="refresh" size={36} spinning={rolling} title="Cambiar plato"
              bg={isLunch ? 'var(--clay-100)' : 'var(--sage-100)'}
              color={isLunch ? 'var(--clay-600)' : 'var(--sage-600)'}
              onClick={() => onReroll(idx, service)} />
          </div>
        </div>
      </div>
    );
  };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 2px 8px' }}>
        <h3 className="p-h2" style={{ margin: 0, fontSize: 19 }}>{day.name}</h3>
        {isToday
          ? <Chip tone="saffron" size="sm">Hoy</Chip>
          : <span className="p-meta" style={{ color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{day.date}</span>}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {serviceCard('lunch')}
        {serviceCard('dinner')}
      </div>
    </div>
  );
}

const DAY_CARDS = { A: DayCardA, B: DayCardB, C: DayCardC };

// ════════════════════════════════════════════════════════════
// "La semana" screen
// ════════════════════════════════════════════════════════════
function WeekScreen({ week, generating, rerolling, onGenerate, onReroll, onOpenAttendance }) {
  const hasMenu = week && week.length > 0;
  const [scrolled, setScrolled] = React.useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar subtitle="¿Qué comemos? · 9–15 jun" title="La semana" scrolled={scrolled}
        trailing={hasMenu && (
          <IconButton name="refresh" size={44} spinning={generating} title="Regenerar la semana" onClick={onGenerate} />
        )} />
      <div onScroll={(e) => setScrolled(e.target.scrollTop > 4)}
        style={{ flex: 1, overflowY: 'auto', padding: `4px 16px ${NAV_H + 16}px` }}>
        {!hasMenu ? (
          <div style={{ paddingTop: 40 }}>
            <EmptyState title="Aún no hay menú esta semana"
              body="Pulsa para que el puchero proponga comida y cena de lunes a domingo, sin repetir."
              action={<Button variant="primary" size="lg" icon="sparkle" loading={generating} onClick={onGenerate}>Generar semana</Button>} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {week.map((day, idx) => (
              <DayCardA key={day.key} day={day} idx={idx} isToday={idx === TODAY_INDEX}
                rerolling={rerolling} onReroll={onReroll} onOpenAttendance={onOpenAttendance} />
            ))}
            <p className="p-meta" style={{ textAlign: 'center', marginTop: 4, color: 'var(--text-tertiary)' }}>
              14 platos · sin repetir esta semana
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Check circle (in / out)
function CheckCircle({ on }) {
  return (
    <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s ease',
      background: on ? 'var(--clay-600)' : 'transparent',
      border: on ? '1.5px solid var(--clay-600)' : '1.5px solid var(--cream-400)' }}>
      {on && <Icon name="check" size={16} color="var(--text-on-clay)" strokeWidth={2.4} />}
    </span>
  );
}

// ════════════════════════════════════════════════════════════
// Bottom sheet — who eats this meal
// ════════════════════════════════════════════════════════════
function AttendanceSheet({ day, service, slot, onToggle, onClose }) {
  const isLunch = service === 'lunch';
  const inCount = attendanceCount(slot);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} className="p-fade"
        style={{ position: 'absolute', inset: 0, background: 'rgba(61,56,47,0.38)' }} />
      <div className="p-sheet" style={{ position: 'relative', background: 'var(--cream-100)',
        borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: '10px 18px 30px',
        boxShadow: '0 -8px 24px rgba(61,56,47,0.14)', maxHeight: '82%', overflowY: 'auto' }}>
        <div style={{ width: 40, height: 5, borderRadius: 999, background: 'var(--cream-400)', margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <ServiceMark service={service} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="p-meta" style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.02em',
              color: isLunch ? 'var(--clay-600)' : 'var(--sage-600)' }}>{day.name} · {isLunch ? 'COMIDA' : 'CENA'}</div>
            <div className="p-h2" style={{ fontSize: 19 }}>{slot.dish}</div>
          </div>
        </div>
        <div className="p-label" style={{ fontSize: 15, marginBottom: 8, color: 'var(--text-secondary)' }}>
          {inCount === 0 ? 'No cocinas para nadie' : inCount === FAMILY.length ? 'Cocinas para todos' : `Cocinas para ${inCount}`}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {FAMILY.map(m => {
            const eats = !slot.absent.includes(m.id);
            return (
              <button key={m.id} onClick={() => onToggle(m.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--cream-300)',
                  background: eats ? 'var(--cream-50)' : 'var(--cream-200)', cursor: 'pointer',
                  padding: '10px 14px', borderRadius: 12, transition: 'background .15s ease', WebkitTapHighlightColor: 'transparent' }}>
                <Avatar name={m.name} toneIndex={m.tone} size={38} dimmed={!eats} />
                <span style={{ flex: 1, textAlign: 'left' }}>
                  <span className="p-label" style={{ display: 'block', fontSize: 16.5,
                    color: eats ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{m.name}</span>
                  <span className="p-meta" style={{ fontSize: 13.5, color: eats ? 'var(--sage-700)' : 'var(--text-tertiary)' }}>
                    {eats ? 'Come en casa' : 'No come en casa'}
                  </span>
                </span>
                <CheckCircle on={eats} />
              </button>
            );
          })}
        </div>
        <Button variant="primary" full size="lg" onClick={onClose}>Listo</Button>
      </div>
    </div>
  );
}

Object.assign(window, { WeekScreen, AttendanceSheet, attendanceCount, EatersRow, ServiceMark });
