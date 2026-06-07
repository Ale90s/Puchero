// puchero-screens.jsx — Calendar, Meals, Login, Splash
// Requires: Icon, PucheroPot, Button, IconButton, Card, Chip, Avatar, Toggle, TopBar, EmptyState,
//           FAMILY, DAYS, TODAY_INDEX, attendanceCount, ServiceMark

// ── Reusable text field ───────────────────────────────────────
function TextField({ label, value, onChange, type = 'text', placeholder, trailing, error, onKeyDown, autoFocus }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <label style={{ display: 'block' }}>
      {label && <span className="p-label" style={{ display: 'block', fontSize: 15, marginBottom: 6 }}>{label}</span>}
      <span style={{ display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--cream-200)', borderRadius: 'var(--r-btn)', padding: '0 14px', minHeight: 52,
        border: `1.5px solid ${error ? 'var(--error-fg)' : focus ? 'var(--clay-500)' : 'var(--cream-300)'}`,
        transition: 'border-color .15s ease' }}>
        <input type={type} value={value} placeholder={placeholder} autoFocus={autoFocus}
          onChange={e => onChange(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          onKeyDown={onKeyDown}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', minWidth: 0,
            fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--text-primary)', padding: '14px 0' }} />
        {trailing}
      </span>
      {error && <span className="p-meta" style={{ display: 'block', color: 'var(--error-fg)', marginTop: 6, fontWeight: 600 }}>{error}</span>}
    </label>
  );
}

// ════════════════════════════════════════════════════════════
// CALENDAR / ATTENDANCE (legacy — merged into the Semana screen; not used)
// ════════════════════════════════════════════════════════════
function MemberPick({ currentUser, onPick }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span className="p-meta" style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Eres</span>
      {FAMILY.map(m => {
        const on = m.id === currentUser;
        return (
          <button key={m.id} onClick={() => onPick(m.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer',
              background: on ? 'var(--clay-600)' : 'var(--cream-200)', color: on ? 'var(--text-on-clay)' : 'var(--text-secondary)',
              borderRadius: 999, padding: '5px 12px 5px 6px', transition: 'all .15s ease', WebkitTapHighlightColor: 'transparent' }}>
            <Avatar name={m.name} toneIndex={m.tone} size={24} />
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5 }}>{m.name}</span>
          </button>
        );
      })}
    </div>
  );
}

function AttendanceSlot({ day, idx, service, currentUser, onToggle, emphasis }) {
  const slot = day[service];
  const isLunch = service === 'lunch';
  const meEats = !slot.absent.includes(currentUser);
  return (
    <div style={{ padding: emphasis ? '14px 0' : '10px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <ServiceMark service={service} size={emphasis ? 38 : 32} />
        <div style={{ flex: 1 }}>
          <div className="p-meta" style={{ fontSize: 12, fontWeight: 700,
            color: isLunch ? 'var(--clay-600)' : 'var(--sage-600)' }}>{isLunch ? 'COMIDA' : 'CENA'}</div>
          <div className="p-label" style={{ fontSize: emphasis ? 16 : 15 }}>{slot.dish}</div>
        </div>
        <Chip tone={attendanceCount(slot) > 0 ? 'sage' : 'cream'} icon="users">{attendanceCount(slot)}</Chip>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
        {FAMILY.map(m => {
          const eats = !slot.absent.includes(m.id);
          const isMe = m.id === currentUser;
          return (
            <button key={m.id} onClick={() => onToggle(idx, service, m.id)} title={`${m.name}: ${eats ? 'en casa' : 'fuera'}`}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
                borderRadius: '50%', WebkitTapHighlightColor: 'transparent',
                boxShadow: isMe ? '0 0 0 2px var(--cream-50), 0 0 0 3.5px var(--clay-500)' : 'none' }}>
              <Avatar name={m.name} toneIndex={m.tone} size={34} dimmed={!eats} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CalendarScreen({ week, currentUser, onPickUser, onToggle }) {
  const [scrolled, setScrolled] = React.useState(false);
  const me = FAMILY.find(m => m.id === currentUser);
  const today = week[TODAY_INDEX];
  const toggleMeToday = (service) => onToggle(TODAY_INDEX, service, currentUser);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar subtitle="¿Para cuántos cocino?" title="Asistencia" scrolled={scrolled} />
      <div onScroll={(e) => setScrolled(e.target.scrollTop > 4)}
        style={{ flex: 1, overflowY: 'auto', padding: `4px 16px ${NAV_H + 16}px` }}>
        <div style={{ marginBottom: 14 }}>
          <MemberPick currentUser={currentUser} onPick={onPickUser} />
        </div>

        {/* "Today" card with the user's own toggles */}
        <Card accent style={{ padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Chip tone="saffron" size="sm">Hoy</Chip>
            <span className="p-h2" style={{ fontSize: 18 }}>{today.name}</span>
          </div>
          {['lunch', 'dinner'].map(service => {
            const meEats = !today[service].absent.includes(currentUser);
            return (
              <div key={service} style={{ display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0', borderTop: service === 'dinner' ? '1px solid var(--cream-200)' : 'none' }}>
                <ServiceMark service={service} size={34} />
                <div style={{ flex: 1 }}>
                  <div className="p-label" style={{ fontSize: 15.5 }}>{service === 'lunch' ? 'Como en casa' : 'Ceno en casa'}</div>
                  <div className="p-meta" style={{ fontSize: 13 }}>{meEats ? 'Cuento contigo' : (service === 'lunch' ? 'Hoy no comes' : 'Hoy no cenas')}</div>
                </div>
                <Toggle on={meEats} onChange={() => toggleMeToday(service)} label={service === 'lunch' ? 'Comer en casa' : 'Cenar en casa'} />
              </div>
            );
          })}
        </Card>

        <div className="p-meta" style={{ fontWeight: 700, color: 'var(--text-secondary)', margin: '0 2px 8px',
          textTransform: 'uppercase', letterSpacing: '.04em', fontSize: 12.5 }}>Toda la semana</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {week.map((day, idx) => (
            <Card key={day.key} accent={idx === TODAY_INDEX} style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 2 }}>
                <h3 className="p-h2" style={{ margin: 0, fontSize: 18 }}>{day.name}</h3>
                {idx === TODAY_INDEX ? <Chip tone="saffron" size="sm">Hoy</Chip>
                  : <span className="p-meta" style={{ color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{day.date}</span>}
              </div>
              <AttendanceSlot day={day} idx={idx} service="lunch" currentUser={currentUser} onToggle={onToggle} />
              <div style={{ height: 1, background: 'var(--cream-200)' }} />
              <AttendanceSlot day={day} idx={idx} service="dinner" currentUser={currentUser} onToggle={onToggle} />
            </Card>
          ))}
          <p className="p-meta" style={{ textAlign: 'center', marginTop: 4, color: 'var(--text-tertiary)' }}>
            Toca un avatar para apuntar o desapuntar a alguien.
          </p>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MEALS (pool)
// ════════════════════════════════════════════════════════════
const MEAL_CATS = [
  { id: 'lunch',  label: 'Comida',  chip: 'Comida',        tone: 'clay',    icon: 'utensils' },
  { id: 'dinner', label: 'Cena',    chip: 'Cena',          tone: 'sage',    icon: 'moon' },
  { id: 'both',   label: 'Ambas',   chip: 'Comida y cena', tone: 'cream',   icon: 'utensils' },
];
const catMeta = (id) => MEAL_CATS.find(c => c.id === id) || MEAL_CATS[2];

// Segmented control to choose a meal category
function CategoryPicker({ value, onChange }) {
  return (
    <div>
      <span className="p-label" style={{ display: 'block', fontSize: 15, marginBottom: 6 }}>¿Para comida o cena?</span>
      <div style={{ display: 'flex', gap: 6, background: 'var(--cream-200)', borderRadius: 'var(--r-btn)', padding: 4 }}>
        {MEAL_CATS.map(c => {
          const on = c.id === value;
          return (
            <button key={c.id} onClick={() => onChange(c.id)}
              style={{ flex: 1, border: 'none', cursor: 'pointer', borderRadius: 9, padding: '9px 6px',
                background: on ? 'var(--cream-50)' : 'transparent',
                boxShadow: on ? 'var(--shadow-card)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all .15s ease', WebkitTapHighlightColor: 'transparent' }}>
              <Icon name={c.icon} size={16} color={on ? 'var(--clay-600)' : 'var(--text-tertiary)'} />
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14.5,
                color: on ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{c.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MealsScreen({ meals, onAdd, onRemove }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [name, setName] = React.useState('');
  const [cat, setCat] = React.useState('both');
  const submit = () => {
    const v = name.trim();
    if (!v) return;
    onAdd(v, cat); setName(''); setCat('both'); setAdding(false);
  };
  const lunchCount = meals.filter(m => m.cat === 'lunch' || m.cat === 'both').length;
  const dinnerCount = meals.filter(m => m.cat === 'dinner' || m.cat === 'both').length;
  const needsMore = lunchCount < 7 || dinnerCount < 7;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar subtitle="Vuestro recetario" title="Comidas" scrolled={scrolled}
        trailing={<Chip tone="clay">{meals.length} platos</Chip>} />
      <div onScroll={(e) => setScrolled(e.target.scrollTop > 4)}
        style={{ flex: 1, overflowY: 'auto', padding: `4px 16px ${NAV_H + 16}px` }}>

        {needsMore && (
          <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', background: 'var(--saffron-100)',
            borderRadius: 'var(--r-card)', padding: '12px 14px', marginBottom: 14 }}>
            <Icon name="sparkle" size={19} color="var(--saffron-600)" style={{ marginTop: 1 }} />
            <span className="p-meta" style={{ color: 'var(--warning-fg)', fontWeight: 600 }}>
              Para que la semana salga sin repetir necesitas 7 comidas y 7 cenas. Tienes {lunchCount} para comer y {dinnerCount} para cenar.
            </span>
          </div>
        )}

        {adding ? (
          <Card style={{ marginBottom: 14, padding: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <TextField label="Nombre del plato" value={name} onChange={setName} autoFocus
                placeholder="p. ej. Lentejas estofadas" onKeyDown={e => e.key === 'Enter' && submit()} />
              <CategoryPicker value={cat} onChange={setCat} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <Button variant="primary" full icon="check" onClick={submit}>Guardar plato</Button>
              <Button variant="secondary" onClick={() => { setAdding(false); setName(''); setCat('both'); }}>Cancelar</Button>
            </div>
          </Card>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <Button variant="primary" full size="lg" icon="plus" onClick={() => setAdding(true)}>Añadir comida</Button>
          </div>
        )}

        {meals.length === 0 ? (
          <div style={{ paddingTop: 24 }}>
            <EmptyState title="Tu recetario está vacío"
              body="Añade los platos que soléis comer en casa, marcando si son para comida o cena."
              action={<Button variant="primary" size="lg" icon="plus" onClick={() => setAdding(true)}>Añadir el primero</Button>} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {meals.map((m, i) => {
              const meta = catMeta(m.cat);
              const isLunch = m.cat === 'lunch';
              const isDinner = m.cat === 'dinner';
              const tileBg = isLunch ? 'var(--clay-100)' : isDinner ? 'var(--sage-100)' : 'var(--cream-200)';
              const tileFg = isLunch ? 'var(--clay-600)' : isDinner ? 'var(--sage-600)' : 'var(--clay-500)';
              return (
                <div key={m.name + i} style={{ display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--cream-50)', borderRadius: 'var(--r-card)', border: '1px solid var(--cream-300)',
                  boxShadow: 'var(--shadow-card)', padding: '12px 14px' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: tileBg, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {m.cat === 'both'
                      ? <PucheroPot size={24} color={tileFg} />
                      : <Icon name={meta.icon} size={20} color={tileFg} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="p-body-l" style={{ display: 'block', fontWeight: 600 }}>{m.name}</span>
                    <Chip tone={meta.tone} size="sm" style={{ marginTop: 3 }}>{meta.chip}</Chip>
                  </div>
                  <IconButton name="x" size={36} bg="transparent" color="var(--text-tertiary)"
                    title="Eliminar plato" onClick={() => onRemove(i)} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════════════════════════
function LoginScreen({ onEnter }) {
  const [email, setEmail] = React.useState('familia@puchero.es');
  const [pass, setPass] = React.useState('comemos');
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const submit = () => {
    if (!email.trim() || !pass.trim()) { setError('Revisa tu email y contraseña.'); return; }
    setError(''); setLoading(true);
    setTimeout(() => { setLoading(false); onEnter(); }, 1400);
  };
  return (
    <div style={{ height: '100%', background: 'var(--cream-100)', display: 'flex', flexDirection: 'column',
      padding: `${STATUS_H + 36}px 28px 40px`, overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 32 }}>
        <PucheroPot size={76} color="var(--clay-600)" steam />
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 38, margin: '14px 0 4px', color: 'var(--clay-700)', letterSpacing: '-0.01em' }}>Puchero</h1>
        <p className="p-body-l" style={{ margin: 0, color: 'var(--text-secondary)' }}>¡Hola! ¿Qué comemos hoy?</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TextField label="Email" type="email" value={email} onChange={v => { setEmail(v); setError(''); }} placeholder="tu@email.es" />
        <TextField label="Contraseña" type={show ? 'text' : 'password'} value={pass}
          onChange={v => { setPass(v); setError(''); }} placeholder="Tu contraseña" error={error}
          onKeyDown={e => e.key === 'Enter' && submit()}
          trailing={<button onClick={() => setShow(s => !s)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <Icon name={show ? 'eyeOff' : 'eye'} size={20} color="var(--text-tertiary)" /></button>} />
        <Button variant="primary" full size="lg" loading={loading} onClick={submit} style={{ marginTop: 4 }}>Entrar</Button>
      </div>
      <p className="p-meta" style={{ textAlign: 'center', marginTop: 'auto', paddingTop: 28, color: 'var(--text-tertiary)' }}>
        Las cuentas las crea quien organiza la casa.<br />¿No puedes entrar? Pídele ayuda.
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// SPLASH
// ════════════════════════════════════════════════════════════
const SPLASH_LINES = ['Poniendo el puchero al fuego…', 'Preparando el menú de la semana…', 'Avivando las brasas…'];
function SplashScreen() {
  const [line, setLine] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setLine(l => (l + 1) % SPLASH_LINES.length), 1500);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ height: '100%', background: 'var(--cream-100)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 4, padding: 32 }}>
      <PucheroPot size={132} color="var(--clay-600)" steam strokeWidth={2} />
      <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 40, margin: '20px 0 0', color: 'var(--clay-700)' }}>Puchero</h1>
      <div style={{ height: 26, marginTop: 6 }}>
        <p key={line} className="p-body p-fade" style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 16 }}>{SPLASH_LINES[line]}</p>
      </div>
      <div style={{ display: 'flex', gap: 7, marginTop: 18 }}>
        {[0, 1, 2].map(i => <span key={i} className="p-blink" style={{ width: 8, height: 8, borderRadius: '50%',
          background: 'var(--clay-300)', animationDelay: `${i * 0.2}s` }} />)}
      </div>
    </div>
  );
}

Object.assign(window, { TextField, CalendarScreen, MealsScreen, LoginScreen, SplashScreen });
