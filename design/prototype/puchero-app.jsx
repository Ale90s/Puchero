// puchero-app.jsx — raíz del prototipo: estado, navegación, re-roll

function ControlPanel({ onGo }) {
  return (
    <div style={{ background: 'var(--cream-50)', borderRadius: 18, border: '1px solid var(--cream-300)',
      boxShadow: 'var(--shadow-card)', padding: 18, width: 248 }}>
      <div className="p-meta" style={{ textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700,
        fontSize: 11.5, color: 'var(--text-tertiary)', marginBottom: 4 }}>Prototipo</div>
      <div className="p-h2" style={{ fontSize: 18, marginBottom: 6 }}>Probar pantallas</div>
      <p className="p-meta" style={{ margin: '0 0 12px', color: 'var(--text-secondary)', textWrap: 'pretty' }}>
        Navega con la barra inferior. Aquí puedes revisar el arranque.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[['splash', 'Carga / splash'], ['login', 'Login']].map(([id, label]) => (
          <button key={id} onClick={() => onGo(id)}
            style={{ textAlign: 'left', cursor: 'pointer', borderRadius: 10, padding: '9px 12px',
              border: '1px solid var(--cream-300)', background: 'var(--cream-50)',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, color: 'var(--text-secondary)' }}>{label}</button>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [stage, setStage] = React.useState('splash'); // splash | login | app
  const [tab, setTab] = React.useState('week');
  const [week, setWeek] = React.useState(() => generateWeek(MEAL_POOL));
  const [meals, setMeals] = React.useState(() => [...MEAL_POOL]);
  const [generating, setGenerating] = React.useState(false);
  const [rerolling, setRerolling] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const [sheet, setSheet] = React.useState(null); // { idx, service } | null

  // Auto-avance del splash
  React.useEffect(() => {
    if (stage !== 'splash') return;
    const t = setTimeout(() => setStage('login'), 2700);
    return () => clearTimeout(t);
  }, [stage]);

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => setToast(null), 2300);
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setWeek(generateWeek(meals));
      setGenerating(false);
      showToast('¡Menú de la semana listo!');
    }, 950);
  };

  const handleReroll = (idx, service) => {
    const key = `${idx}-${service}`;
    if (rerolling) return;
    setRerolling(key);
    setTimeout(() => {
      setWeek(w => w.map((d, i) => i !== idx ? d
        : { ...d, [service]: { ...d[service], dish: randomDishExcluding(d[service].dish, service, meals) } }));
      setRerolling(null);
    }, 760);
  };

  const handleToggleAttendance = (idx, service, memberId) => {
    setWeek(w => w.map((d, i) => {
      if (i !== idx) return d;
      const absent = d[service].absent.includes(memberId)
        ? d[service].absent.filter(x => x !== memberId)
        : [...d[service].absent, memberId];
      return { ...d, [service]: { ...d[service], absent } };
    }));
  };

  const handleAddMeal = (name, cat) => { setMeals(m => [{ name, cat }, ...m]); showToast('Plato añadido al recetario'); };
  const handleRemoveMeal = (i) => { setMeals(m => m.filter((_, j) => j !== i)); showToast('Plato eliminado', 'info'); };

  const onGo = (id) => setStage(id);

  let screen;
  if (stage === 'app') {
    if (tab === 'week') screen = <WeekScreen week={week} generating={generating}
      rerolling={rerolling} onGenerate={handleGenerate} onReroll={handleReroll}
      onOpenAttendance={(idx, service) => setSheet({ idx, service })} />;
    else screen = <MealsScreen meals={meals} onAdd={handleAddMeal} onRemove={handleRemoveMeal} />;
  } else if (stage === 'login') {
    screen = <LoginScreen onEnter={() => { setStage('app'); setTab('week'); }} />;
  } else {
    screen = <SplashScreen />;
  }

  const chrome = stage === 'app';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', gap: 40, padding: 40, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative' }}>
        <IOSDevice>
          <div style={{ height: '100%', position: 'relative', background: 'var(--cream-100)' }}>
            {screen}
            {chrome && <BottomNav active={tab} onNavigate={setTab} />}
            {chrome && sheet && (
              <AttendanceSheet day={week[sheet.idx]} service={sheet.service} slot={week[sheet.idx][sheet.service]}
                onToggle={(memberId) => handleToggleAttendance(sheet.idx, sheet.service, memberId)}
                onClose={() => setSheet(null)} />
            )}
            {toast && <Toast message={toast.message} tone={toast.tone} />}
          </div>
        </IOSDevice>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ maxWidth: 248 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <PucheroPot size={26} color="var(--clay-600)" />
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 22, color: 'var(--clay-700)' }}>Puchero</span>
          </div>
          <p className="p-meta" style={{ margin: 0, color: 'var(--text-secondary)' }}>Prototipo interactivo · planificador de comidas familiar</p>
        </div>
        {stage !== 'app' && (
          <div style={{ width: 248, background: 'var(--clay-100)', borderRadius: 14,
            padding: '12px 14px' }}>
            <div className="p-meta" style={{ color: 'var(--clay-700)', fontWeight: 600 }}>
              {stage === 'splash' ? 'Arranque en frío (~3 s) con vapor animado; luego pasa al login.'
                : 'Email y contraseña ya rellenos — pulsa Entrar para ver el estado de carga.'}
            </div>
          </div>
        )}
        <ControlPanel onGo={onGo} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
