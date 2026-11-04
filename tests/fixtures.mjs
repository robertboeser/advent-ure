// Kleiner Testgraph, unabhängig vom echten Spielinhalt.

export const config = {
  start: 'start',
  midnight: 60,
  attrs: {
    zeit: { start: 0, min: 0 },
    waerme: { start: 5, min: 0, max: 10 },
    guete: { start: 0, min: -5, max: 12 },
  },
  climateLoss: { warm: 0, mild: 0, kalt: 1, eisig: 2 },
  coldProtection: ['schal', 'funke'],
  conditions: {
    warmherzig: { attr: { guete: { gte: 2 } } },
  },
  endings: { freeze: 'erfroren', midnight: 'mitternacht' },
  midnightGuardFlag: 'licht',
  clock: {
    start: 23 * 60,
    interval: 15,
    chime: (abs, remaining) => `Glocke ${abs} (${remaining})`,
  },
};

export const items = {
  schal: { name: 'Schal' },
  keks: {
    name: 'Keks',
    use: { label: 'Essen', effects: { take: { keks: 1 }, attr: { waerme: 1 } }, response: 'Lecker.' },
  },
  funke: { name: 'Funke' },
};

export const stations = [
  {
    id: 'start',
    title: 'Start',
    climate: 'mild',
    text: ['Du stehst am Start.', { if: { flag: 'besucht' }, text: 'Du warst schon hier.' }],
    choices: [
      { label: 'Keks nehmen', effects: { give: { keks: 2 } }, response: 'Zwei Kekse.' },
      { label: 'Schal nehmen', effects: { give: { schal: 1 } } },
      { label: 'Warten', minutes: 10, once: false },
      { label: 'Nach draußen', to: 'draussen', minutes: 10 },
      { label: 'Ins Eis', to: 'eis', minutes: 5 },
      { label: 'Gesperrt', to: 'draussen', if: { has: 'funke' }, showLocked: true, hint: 'Du brauchst einen Funken.' },
      { label: 'Versteckt', to: 'draussen', if: { flag: 'nie' } },
      { label: 'Gut sein', effects: { attr: { guete: 2 } } },
      { label: 'Nur für Gute', to: 'gut', if: { ref: 'warmherzig' } },
    ],
  },
  {
    id: 'draussen',
    title: 'Draußen',
    climate: 'kalt',
    onEnter: { set: ['besucht'] },
    text: [{ if: { first: true }, text: 'Zum ersten Mal draußen.' }, 'Es ist kalt.'],
    choices: [
      { label: 'Zurück', to: 'start', minutes: 0 },
      { label: 'Licht anzünden', to: 'hell', effects: { set: ['licht'] } },
    ],
  },
  {
    id: 'eis',
    title: 'Eis',
    climate: 'eisig',
    text: ['Eisig.'],
    choices: [{ label: 'Zurück', to: 'start', minutes: 5 }],
  },
  { id: 'gut', title: 'Gut', climate: 'mild', text: ['Gut.'], choices: [{ label: 'Zurück', to: 'start' }] },
  { id: 'hell', title: 'Hell', climate: 'warm', text: ['Licht!'], choices: [], ending: { number: 1, title: 'Hell', memory: 'm_hell' } },
  { id: 'erfroren', title: 'Erfroren', climate: 'eisig', text: ['Kalt.'], choices: [], ending: { number: 2, title: 'Erfroren' } },
  { id: 'mitternacht', title: 'Mitternacht', climate: 'kalt', text: ['Zu spät.'], choices: [], ending: { number: 3, title: 'Zu spät' } },
];

export const data = { stations, items, config };

/** Index einer Wahl anhand ihres Labels finden. */
export function indexOf(engine, state, label) {
  const station = engine.station(state);
  const index = station.choices.findIndex((c) => c.label === label);
  if (index < 0) throw new Error(`Wahl nicht gefunden: ${label}`);
  return index;
}
