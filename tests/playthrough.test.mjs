// Vollständige Durchgänge durch den echten Spielinhalt – zu jedem der sieben Enden.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEngine } from '../js/engine/engine.js';
import { gameData } from '../data/index.js';

const engine = createEngine(gameData);

/**
 * Spielt eine Folge von Wahlen (per Label). „essen:lebkuchen“ benutzt einen Gegenstand.
 * Bei mehreren Wahlen mit gleichem Label wird die erste verfügbare genommen.
 */
export function play(steps, state = engine.newGame()) {
  const events = [];
  for (const step of steps) {
    if (step.startsWith('essen:')) {
      const r = engine.useItem(state, step.slice(6));
      state = r.state;
      events.push(...r.events);
      continue;
    }
    const choice = engine.choices(state).find((c) => c.label === step && !c.locked);
    if (!choice) {
      const available = engine.choices(state).map((c) => `${c.locked ? '(gesperrt) ' : ''}${c.label}`);
      assert.fail(`In „${state.station}“ (Zeit ${state.attrs.zeit}, Wärme ${state.attrs.waerme}) gibt es „${step}“ nicht.\nVerfügbar: ${available.join(' | ')}`);
    }
    const r = engine.choose(state, choice.index);
    state = r.state;
    events.push(...r.events);
    assert.ok(engine.text(state).length > 0, `Station ${state.station} hat keinen Text`);
  }
  return { state, events };
}

/** Schnellster Weg zum besten Ende, ohne Wald (siehe STATIONSGRAPH.md §7). */
export const GOLDEN_PATH_TO_TOWER = [
  'An die Tür des Wärterhäuschens klopfen',
  'Einen Becher Tee annehmen', 'Um die Sturmlaterne bitten', 'Hinaus und hinunter ins Dorf',
  'Zu Omas Haus am Dorfrand', 'Eintreten',
  'Den Brief lesen', 'Den Brief einstecken',
  'In die Küche', 'Die Streichhölzer vom Sims nehmen', 'Die blaue Dose öffnen', 'Die Zimtsterne einpacken', 'Zurück in die Stube',
  'Den Kachelofen anheizen',
  'Die Stiege zum Dachboden hinauf', 'Die alte Truhe öffnen', 'Den Wollschal umlegen', 'Die Spieldose mitnehmen', 'Die Truhe schließen',
  'Dem Rascheln nachgehen', 'Ihm einen Lebkuchen schenken', 'Hinunter in die Stube',
  'In die Küche', 'Milch auf dem Herd wärmen und trinken', 'Zurück in die Stube', 'Hinaus vor das Haus',
  'Zum Dorfplatz', 'Zur Maronenfrau gehen',
  'Nach dem Schneeweber fragen', 'Ihren Maronenofen anzünden', 'Ihr einen Lebkuchen schenken', 'Zurück auf den Platz',
  'Den Bachweg zur alten Mühle', 'Dem Weg zur Mühle folgen', 'Durch die knarrende Tür hinein',
  'Zum Wichtelrat gehen', 'Um Reparatur der Spieldose bitten', 'Dich verabschieden',
  'Das Mahlwerk untersuchen', 'Pimpernell durch die Falltür folgen', 'Durch die Klappe hinter dem Altar steigen',
  'Den Küster ansprechen', 'Ihm Omas Brief zeigen', 'Zurück ins Kirchenschiff',
  'Eine Flamme vom Ewigen Licht nehmen', 'Hinaus auf den Vorplatz', 'Zurück zum Dorfplatz',
  'Zu Omas Haus', 'Eintreten', 'Den Adventskalender betrachten',
  'Die Flammenrune mit der Flamme des Ewigen Lichts tauen', 'Die Spieldose am Siegel spielen',
  'Den Strohstern auf die Herzrune legen', 'Die vierundzwanzigste Tür öffnen',
  'Den Funken in die Laterne setzen und zur Kirche eilen',
  'Die Kirche betreten', 'Den Küster ansprechen', 'Ihm den Lichtfunken zeigen', 'Zurück ins Kirchenschiff',
  'Hinaus auf den Vorplatz', 'Die Turmtür aufschließen', 'Mit dem Lichtfunken hinaufsteigen',
];

test('Ende 1 – Die Heilige Nacht (Golden Path)', () => {
  const { state, events } = play([
    ...GOLDEN_PATH_TO_TOWER,
    'Mit dem Schneeweber sprechen', 'Omas Spieldose für ihn spielen', 'Gemeinsam die Sternlaterne entzünden',
  ]);
  assert.equal(state.station, 'ende_heilige_nacht');
  assert.ok(state.flags.laterne_brennt);
  assert.ok(state.attrs.zeit < 180, `Zeit ${state.attrs.zeit}`);
  assert.ok(events.some((e) => e.type === 'memory' && e.id === 'ende_heilige_nacht'));
  const text = engine.text(state).join('\n');
  assert.match(text, /Pimpernell|Wichtelschrift/);
  assert.match(text, /Sturmlaterne zurück/);
});

test('Ende 2 – Die Laterne brennt', () => {
  const { state } = play([...GOLDEN_PATH_TO_TOWER, 'Den Lichtfunken in die Sternlaterne setzen']);
  assert.equal(state.station, 'ende_laterne');
});

test('Ende 3 – Der ewige Winter', () => {
  const { state } = play([...GOLDEN_PATH_TO_TOWER, 'Ihm den Lichtfunken geben']);
  assert.equal(state.station, 'ende_ewiger_winter');
});

test('Ende 4 – Zu spät', () => {
  const steps = [
    'An die Tür des Wärterhäuschens klopfen', 'Hinaus und hinunter ins Dorf', 'Zu Omas Haus am Dorfrand', 'Eintreten',
    'In die Küche', 'Die Streichhölzer vom Sims nehmen', 'Zurück in die Stube', 'Den Kachelofen anheizen',
  ];
  let { state } = play(steps);
  while (!engine.isEnding(state)) ({ state } = play(['Dich am Kachelofen aufwärmen'], state));
  assert.equal(state.station, 'ende_zu_spaet');
  assert.equal(state.attrs.zeit, 180);
});

test('Ende 5 – Schneeschlaf', () => {
  let { state } = play(['Dem Pfad ins Dorf folgen']);
  while (!engine.isEnding(state)) {
    ({ state } = play([state.station === 'dorfweg' ? 'Zurück zum Bahnhof' : 'Dem Pfad ins Dorf folgen'], state));
  }
  assert.equal(state.station, 'ende_schneeschlaf');
  assert.equal(state.attrs.waerme, 0);
});

test('Ende 6 – Heimweg', () => {
  const { state } = play(['Zurück in den warmen Zug steigen']);
  assert.equal(state.station, 'ende_heimweg');
});

test('Ende 7 – Der neue Weber', () => {
  const { state } = play([
    'An die Tür des Wärterhäuschens klopfen', 'Einen Becher Tee annehmen', 'Hinaus und hinunter ins Dorf',
    'Den Spuren in den Wald folgen', 'Zum glitzernden Eissee', 'Omas Korb untersuchen',
    'Über das Eis zum Webstuhl gehen', 'Anbieten, Omas Platz einzunehmen',
  ]);
  assert.equal(state.station, 'ende_schneeweber');
});

test('Wald-Variante: Köhlerglut, Fuchs, Schneeweber-Gespräch', () => {
  const { state } = play([
    'An die Tür des Wärterhäuschens klopfen', 'Einen Becher Tee annehmen', 'Hinaus und hinunter ins Dorf',
    'Den Spuren in den Wald folgen', 'Dem Wimmern nachgehen', 'Die Schlinge vorsichtig lösen', 'Zurück zum Waldrand',
    'Dem Fuchs folgen, der vorausläuft', 'Dich am Feuer aufwärmen', 'Nach dem Schneeweber fragen',
    'Ihm beim Holzhacken helfen', 'Die Axt zurückgeben', 'Zurück zum Waldrand',
    'Zum glitzernden Eissee', 'Über das Eis zum Webstuhl gehen', 'Ihn fragen, warum er das tut', 'Schweigend nicken',
  ]);
  assert.equal(state.station, 'webstuhl');
  assert.ok(state.flags.fuchs_freund && state.flags.holz_gehackt && state.flags.schneeweber_verstanden);
  assert.equal(state.attrs.guete, 3);
});

test('Ruprecht gibt Glut erst nach Holzhacken oder bei Güte ≥ 2', () => {
  let { state } = play([
    'An die Tür des Wärterhäuschens klopfen', 'Um die Sturmlaterne bitten', 'Einen Becher Tee annehmen',
    'Hinaus und hinunter ins Dorf', 'Den Spuren in den Wald folgen', 'Mit der Laterne dem Rauchgeruch folgen',
    'Um Glut aus dem Meiler bitten',
  ]);
  assert.ok(!state.items.glut, 'abgelehnt');
  ({ state } = play(['Ihm beim Holzhacken helfen', 'Die Axt zurückgeben', 'Um Glut aus dem Meiler bitten'], state));
  assert.equal(state.items.glut, 1);
});
