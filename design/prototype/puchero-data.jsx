// puchero-data.jsx — sample data and menu logic

const FAMILY = [
  { id: 'marta',  name: 'Marta',  tone: 0 },
  { id: 'javier', name: 'Javier', tone: 1 },
  { id: 'lucia',  name: 'Lucía',  tone: 2 },
  { id: 'pablo',  name: 'Pablo',  tone: 3 },
  { id: 'nora',   name: 'Nora',   tone: 4 },
];

// Each meal has a category: 'lunch' (comida) | 'dinner' (cena) | 'both' (ambas).
// 'both' meals can land in either service.
const MEAL_POOL = [
  { name: 'Lentejas estofadas',        cat: 'lunch'  },
  { name: 'Macarrones con tomate',     cat: 'both'   },
  { name: 'Pollo al horno con patatas',cat: 'both'   },
  { name: 'Tortilla de patatas',       cat: 'both'   },
  { name: 'Merluza a la plancha',      cat: 'dinner' },
  { name: 'Garbanzos con espinacas',   cat: 'lunch'  },
  { name: 'Arroz a la cubana',         cat: 'lunch'  },
  { name: 'Filetes rusos',             cat: 'both'   },
  { name: 'Crema de calabacín',        cat: 'dinner' },
  { name: 'Ensalada de pasta',         cat: 'both'   },
  { name: 'Pisto con huevo',           cat: 'dinner' },
  { name: 'Croquetas caseras',         cat: 'both'   },
  { name: 'Lomo adobado',              cat: 'both'   },
  { name: 'Sopa de fideos',            cat: 'dinner' },
  { name: 'Albóndigas en salsa',       cat: 'lunch'  },
  { name: 'Espaguetis carbonara',      cat: 'both'   },
  { name: 'Salmón al horno',           cat: 'dinner' },
  { name: 'Judías verdes con jamón',   cat: 'dinner' },
  { name: 'Coliflor gratinada',        cat: 'dinner' },
  { name: 'Hamburguesas caseras',      cat: 'both'   },
];

// Meals eligible for a given service (its own category or 'both')
function eligibleFor(service, meals) {
  return meals.filter(m => m.cat === service || m.cat === 'both');
}

const DAYS = [
  { key: 'lun', name: 'Lunes',     short: 'L', date: '9 jun' },
  { key: 'mar', name: 'Martes',    short: 'M', date: '10 jun' },
  { key: 'mie', name: 'Miércoles', short: 'X', date: '11 jun' },
  { key: 'jue', name: 'Jueves',    short: 'J', date: '12 jun' },
  { key: 'vie', name: 'Viernes',   short: 'V', date: '13 jun' },
  { key: 'sab', name: 'Sábado',    short: 'S', date: '14 jun' },
  { key: 'dom', name: 'Domingo',   short: 'D', date: '15 jun' },
];

const TODAY_INDEX = 2; // Wednesday highlighted as "today"

// Generate a week respecting categories: lunch slots get lunch/both meals,
// dinner slots get dinner/both meals. Avoid repeats across the week when possible.
function generateWeek(meals = MEAL_POOL) {
  const used = new Set();
  const pick = (service) => {
    const eligible = eligibleFor(service, meals);
    const fresh = eligible.filter(m => !used.has(m.name));
    const pool = fresh.length ? fresh : eligible; // allow repeats if we run out
    if (!pool.length) return '—';
    const choice = pool[Math.floor(Math.random() * pool.length)];
    used.add(choice.name);
    return choice.name;
  };
  return DAYS.map(d => ({
    ...d,
    lunch:  { dish: pick('lunch'),  absent: [] },
    dinner: { dish: pick('dinner'), absent: [] },
  }));
}

function randomDishExcluding(current, service, meals = MEAL_POOL) {
  const pool = eligibleFor(service, meals).filter(m => m.name !== current);
  if (!pool.length) return current;
  return pool[Math.floor(Math.random() * pool.length)].name;
}

Object.assign(window, { FAMILY, MEAL_POOL, DAYS, TODAY_INDEX, generateWeek, randomDishExcluding, eligibleFor });
