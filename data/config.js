// Zentrale Spielkonfiguration: Startwerte, Klimaregeln, Uhrzeit.
// Balancing-Werte (siehe Meilenstein M7) werden ausschließlich hier gepflegt.

const HOUR_WORDS = ['zwölf', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf'];
const MINUTE_WORDS = { 15: 'fünfzehn', 30: 'dreißig', 45: 'fünfundvierzig' };

const hourWord = (h) => HOUR_WORDS[((h % 12) + 12) % 12];

/** „Viertel nach zehn“, „halb elf“, … für eine absolute Uhrzeit in Minuten. */
export function clockPhrase(absMinutes) {
  const h = Math.floor(absMinutes / 60) % 24;
  const m = absMinutes % 60;
  if (m === 0) return hourWord(h);
  if (m === 15) return `Viertel nach ${hourWord(h)}`;
  if (m === 30) return `halb ${hourWord(h + 1)}`;
  if (m === 45) return `Viertel vor ${hourWord(h + 1)}`;
  return `${h}:${String(m).padStart(2, '0')}`;
}

/** „eine Stunde und fünfzehn Minuten“, „eine halbe Stunde“, … */
export function durationWords(minutes) {
  if (minutes === 30) return 'eine halbe Stunde';
  if (minutes === 90) return 'anderthalb Stunden';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hours = h === 0 ? '' : h === 1 ? 'eine Stunde' : `${hourWord(h)} Stunden`;
  const mins = m === 0 ? '' : `${MINUTE_WORDS[m] ?? m} Minuten`;
  return [hours, mins].filter(Boolean).join(' und ');
}

export const config = {
  start: 'bahnhof',
  /** Minuten seit 21:00 Uhr, bei denen Mitternacht erreicht ist. */
  midnight: 180,

  attrs: {
    zeit: { start: 0, min: 0 },
    waerme: { start: 7, min: 0, max: 10 },
    guete: { start: 0, min: -5, max: 12 },
  },

  /** Wärmeverlust beim Betreten einer Station über einen Weg mit Zeitkosten. */
  climateLoss: { warm: 0, mild: 0, kalt: 1, eisig: 2 },
  /** Jeder dieser Gegenstände mindert den Kälteverlust um 1. */
  coldProtection: ['schal', 'lichtfunke'],

  conditions: {
    kennt_legende: {
      any: [{ flag: 'legende_agathe' }, { flag: 'legende_ruprecht' }, { flag: 'schneeweber_verstanden' }],
    },
    hat_flamme: { any: [{ has: 'kirchenflamme' }, { has: 'glut' }] },
  },

  endings: { freeze: 'ende_schneeschlaf', midnight: 'ende_zu_spaet' },
  midnightGuardFlag: 'laterne_brennt',

  clock: {
    start: 21 * 60,
    interval: 15,
    chime(absMinutes, remaining) {
      const phrase = clockPhrase(absMinutes);
      if (remaining >= 120) {
        return `Vom Kirchturm schlägt es ${phrase}, dünn und gläsern, als wäre auch die Uhr halb erfroren.`;
      }
      if (remaining >= 60) {
        return `Vom Kirchturm schlägt es ${phrase}. Noch ${durationWords(remaining)} bis Mitternacht.`;
      }
      return `Vom Kirchturm schlägt es ${phrase}. Nur noch ${durationWords(remaining)} bis Mitternacht!`;
    },
  },

  /** Wärme-Beschreibungen für die Statusleiste (ab Mindestwert). */
  warmthLabels: [
    [9, 'behaglich'],
    [7, 'warm'],
    [5, 'kühl'],
    [3, 'frierend'],
    [1, 'eiskalt'],
    [0, 'erfroren'],
  ],
};
