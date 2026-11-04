import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEngine } from '../js/engine/engine.js';
import { data, indexOf } from './fixtures.mjs';

const engine = createEngine(data);
const play = (state, ...labels) => {
  let events = [];
  for (const label of labels) {
    ({ state, events } = engine.choose(state, indexOf(engine, state, label)));
  }
  return { state, events };
};

test('Text-Varianten werden nach Bedingungen gefiltert', () => {
  let s = engine.newGame();
  assert.deepEqual(engine.text(s), ['Du stehst am Start.']);
  ({ state: s } = play(s, 'Nach draußen'));
  assert.deepEqual(engine.text(s), ['Zum ersten Mal draußen.', 'Es ist kalt.']);
  ({ state: s } = play(s, 'Zurück', 'Nach draußen'));
  assert.deepEqual(engine.text(s), ['Es ist kalt.']);
  ({ state: s } = play(s, 'Zurück'));
  assert.deepEqual(engine.text(s), ['Du stehst am Start.', 'Du warst schon hier.']);
});

test('choices blendet aus, sperrt sichtbar und markiert Aktionen', () => {
  const s = engine.newGame();
  const list = engine.choices(s);
  const labels = list.map((c) => c.label);
  assert.ok(!labels.includes('Versteckt'));
  assert.ok(!labels.includes('Nur für Gute'));
  const locked = list.find((c) => c.label === 'Gesperrt');
  assert.equal(locked.locked, true);
  assert.equal(locked.hint, 'Du brauchst einen Funken.');
  assert.equal(list.find((c) => c.label === 'Keks nehmen').action, true);
  assert.equal(list.find((c) => c.label === 'Nach draußen').action, false);
});

test('einmalige Aktionen verschwinden, wiederholbare bleiben', () => {
  let s = engine.newGame();
  const { state, events } = play(s, 'Keks nehmen');
  s = state;
  assert.equal(s.station, 'start');
  assert.equal(s.items.keks, 2);
  assert.ok(events.some((e) => e.type === 'response' && e.text === 'Zwei Kekse.'));
  assert.ok(!engine.choices(s).some((c) => c.label === 'Keks nehmen'));
  ({ state: s } = play(s, 'Warten', 'Warten'));
  assert.ok(engine.choices(s).some((c) => c.label === 'Warten'));
  assert.equal(s.attrs.zeit, 20);
});

test('Aktionen zählen nicht als erneuter Besuch', () => {
  const { state } = play(engine.newGame(), 'Keks nehmen', 'Schal nehmen');
  assert.equal(state.visits.start, 1);
});

test('nicht verfügbare Wahlen werfen', () => {
  const s = engine.newGame();
  assert.throws(() => engine.choose(s, indexOf(engine, s, 'Gesperrt')), /nicht verfügbar/);
  assert.throws(() => engine.choose(s, 99), /existiert nicht/);
});

test('choose verändert den Eingangszustand nicht', () => {
  const s = engine.newGame();
  const copy = JSON.parse(JSON.stringify(s));
  play(s, 'Keks nehmen', 'Nach draußen');
  assert.deepEqual(s, copy);
});

test('Kälte: kalt −1, eisig −2, nur bei Zeitkosten', () => {
  let { state } = play(engine.newGame(), 'Nach draußen');
  assert.equal(state.attrs.waerme, 4);
  ({ state } = play(state, 'Zurück')); // 0 Minuten, mild
  assert.equal(state.attrs.waerme, 4);
  const r = play(state, 'Ins Eis');
  assert.equal(r.state.attrs.waerme, 2);
  assert.ok(r.events.some((e) => e.type === 'attr' && e.id === 'waerme' && e.delta === -2 && e.reason === 'cold'));
});

test('Kälte: Schal und Funke mindern den Verlust, nie negativ', () => {
  let { state } = play(engine.newGame(), 'Schal nehmen', 'Ins Eis');
  assert.equal(state.attrs.waerme, 4);
  state = { ...state, items: { ...state.items, funke: 1 } };
  ({ state } = play(state, 'Zurück', 'Ins Eis'));
  assert.equal(state.attrs.waerme, 4);
  ({ state } = play(state, 'Zurück', 'Nach draußen'));
  assert.equal(state.attrs.waerme, 4);
});

test('Wärme 0 führt zum Schneeschlaf', () => {
  let s = { ...engine.newGame(), attrs: { zeit: 0, waerme: 2, guete: 0 } };
  const { state, events } = play(s, 'Ins Eis');
  assert.equal(state.station, 'erfroren');
  assert.ok(engine.isEnding(state));
  assert.ok(events.some((e) => e.type === 'ending' && e.id === 'erfroren'));
});

test('Mitternacht ohne Licht führt zum Ende „Zu spät“', () => {
  let s = { ...engine.newGame(), attrs: { zeit: 55, waerme: 9, guete: 0 } };
  const { state } = play(s, 'Warten');
  assert.equal(state.station, 'mitternacht');
});

test('ein explizites Ende hat Vorrang vor den globalen Regeln', () => {
  let s = { ...engine.newGame(), attrs: { zeit: 55, waerme: 1, guete: 0 } };
  ({ state: s } = play(s, 'Nach draußen')); // Zeit 65, Wärme 0 → Schneeschlaf
  assert.equal(s.station, 'erfroren');

  s = { ...engine.newGame(), station: 'draussen', attrs: { zeit: 70, waerme: 0, guete: 0 } };
  const { state, events } = play(s, 'Licht anzünden');
  assert.equal(state.station, 'hell');
  assert.ok(events.some((e) => e.type === 'memory' && e.id === 'm_hell'));
});

test('Schneeschlaf wird vor Mitternacht geprüft', () => {
  const s = { ...engine.newGame(), attrs: { zeit: 55, waerme: 1, guete: 0 } };
  const { state } = play(s, 'Nach draußen');
  assert.equal(state.station, 'erfroren');
});

test('Glockenschlag bei Überschreiten einer Viertelstunde', () => {
  let { state, events } = play(engine.newGame(), 'Warten');
  assert.equal(events.filter((e) => e.type === 'clock').length, 0);
  ({ state, events } = play(state, 'Warten'));
  const clock = events.find((e) => e.type === 'clock');
  assert.deepEqual(clock, { type: 'clock', minutes: 15, remaining: 45, text: 'Glocke 1395 (45)' });
  ({ state, events } = play(state, 'Warten'));
  assert.deepEqual(events.filter((e) => e.type === 'clock').map((e) => e.minutes), [30]);
  ({ events } = play(state, 'Warten'));
  assert.equal(events.filter((e) => e.type === 'clock').length, 0, '30 → 40 überschreitet keine Viertelstunde');
});

test('benannte Bedingungen aus der Konfiguration', () => {
  const { state } = play(engine.newGame(), 'Gut sein');
  assert.ok(engine.choices(state).some((c) => c.label === 'Nur für Gute'));
});

test('Gegenstände benutzen', () => {
  let { state } = play(engine.newGame(), 'Keks nehmen');
  assert.deepEqual(engine.itemActions(state, 'keks'), [{ label: 'Essen' }]);
  assert.deepEqual(engine.itemActions(state, 'schal'), []);
  const r = engine.useItem(state, 'keks');
  assert.equal(r.state.items.keks, 1);
  assert.equal(r.state.attrs.waerme, 6);
  assert.ok(r.events.some((e) => e.type === 'response'));
  ({ state } = play(state, 'Nach draußen', 'Licht anzünden'));
  assert.deepEqual(engine.itemActions(state, 'keks'), [], 'auf Enden nicht benutzbar');
  assert.throws(() => engine.useItem(state, 'keks'));
});

test('isValidState erkennt kaputte Spielstände', () => {
  const s = engine.newGame();
  assert.equal(engine.isValidState(s), true);
  assert.equal(engine.isValidState(null), false);
  assert.equal(engine.isValidState({ ...s, station: 'gibtsnicht' }), false);
  assert.equal(engine.isValidState({ ...s, version: 99 }), false);
  assert.equal(engine.isValidState({ ...s, attrs: {} }), false);
});

test('formatClock', () => {
  assert.equal(engine.formatClock(0), '23:00');
  assert.equal(engine.formatClock(65), '00:05');
});

test('doppelte IDs und fehlender Start werden erkannt', () => {
  assert.throws(() => createEngine({ ...data, stations: [...data.stations, data.stations[0]] }), /Doppelte/);
  assert.throws(() => createEngine({ ...data, config: { ...data.config, start: 'x' } }), /Startstation/);
});
