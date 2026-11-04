// Balancing-Ziele aus dem Umsetzungsplan (M7) als Tests.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEngine } from '../js/engine/engine.js';
import { gameData } from '../data/index.js';
import { evaluateRoutes, randomPlayouts } from '../tools/simulate.mjs';
import { ROUTES } from '../tools/routes.mjs';

const engine = createEngine(gameData, { keepLog: false });
const results = evaluateRoutes(engine);

for (const [name, route] of Object.entries(ROUTES)) {
  test(`Route „${name}“ erfüllt ihre Zielwerte`, () => {
    assert.deepEqual(results[name].problems, []);
  });
}

test('Golden Path: mindestens 30 Minuten Puffer bis Mitternacht', () => {
  assert.ok(results.golden.buffer >= 30, `Puffer ${results.golden.buffer}`);
});

test('Alles in einem Durchgang ist nicht möglich', () => {
  const { run } = results.komplett;
  assert.ok(engine.isEnding(run.state), 'Komplett-Route darf nicht ohne Ende durchlaufen');
  assert.notEqual(run.state.station, 'ende_heilige_nacht');
});

test('Zufallsdurchläufe finden keine Sackgassen und keine leeren Texte', () => {
  const checkpoints = Object.values(results).flatMap(({ run }) => run.states.filter((s) => !engine.isEnding(s)));
  const mc = randomPlayouts(engine, { runs: 3000, seed: 7, checkpoints });
  assert.deepEqual(mc.deadEnds, []);
  assert.deepEqual(mc.emptyTexts, []);
  assert.equal(mc.stuck, 0);
});
