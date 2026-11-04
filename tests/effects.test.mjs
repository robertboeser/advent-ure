import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyEffects } from '../js/engine/effects.js';
import { clampAttr, cloneState, createInitialState } from '../js/engine/state.js';
import { config } from './fixtures.mjs';

const fresh = () => createInitialState(config, { now: new Date('2026-12-24T20:00:00Z') });

test('Initialzustand übernimmt Startwerte', () => {
  const s = fresh();
  assert.equal(s.station, 'start');
  assert.deepEqual(s.attrs, { zeit: 0, waerme: 5, guete: 0 });
  assert.deepEqual(s.visits, { start: 1 });
  assert.equal(s.startedAt, '2026-12-24T20:00:00.000Z');
});

test('give und take mit Mengen; nie unter 0', () => {
  const s = fresh();
  let events = applyEffects(s, { give: { keks: 3 } }, config);
  assert.equal(s.items.keks, 3);
  assert.deepEqual(events, [{ type: 'item', id: 'keks', delta: 3 }]);
  events = applyEffects(s, { take: { keks: 5 } }, config);
  assert.equal(s.items.keks, undefined);
  assert.deepEqual(events, [{ type: 'item', id: 'keks', delta: -3 }]);
  events = applyEffects(s, { take: { keks: 1 } }, config);
  assert.deepEqual(events, []);
});

test('set und unset von Flags', () => {
  const s = fresh();
  applyEffects(s, { set: ['a', 'b'] }, config);
  applyEffects(s, { set: 'c', unset: ['a'] }, config);
  assert.deepEqual(s.flags, { b: true, c: true });
});

test('Attribute werden begrenzt, Ereignis enthält tatsächliche Änderung', () => {
  const s = fresh();
  const events = applyEffects(s, { attr: { waerme: 20 } }, config);
  assert.equal(s.attrs.waerme, 10);
  assert.deepEqual(events, [{ type: 'attr', id: 'waerme', delta: 5 }]);
  assert.deepEqual(applyEffects(s, { attr: { waerme: 1 } }, config), []);
  applyEffects(s, { attr: { guete: -99 } }, config);
  assert.equal(s.attrs.guete, -5);
});

test('memory erzeugt nur ein Ereignis', () => {
  const s = fresh();
  assert.deepEqual(applyEffects(s, { memory: 'tee' }, config), [{ type: 'memory', id: 'tee' }]);
});

test('unbekannte Effekte und Attribute werfen', () => {
  assert.throws(() => applyEffects(fresh(), { zaubern: 1 }, config), /Unbekannter Effekt/);
  assert.throws(() => clampAttr(config, 'mana', 1), /Unbekanntes Attribut/);
});

test('cloneState kopiert veränderliche Teile', () => {
  const s = fresh();
  const c = cloneState(s);
  c.items.x = 1;
  c.flags.y = true;
  c.log.push('z');
  assert.equal(s.items.x, undefined);
  assert.equal(s.flags.y, undefined);
  assert.equal(s.log.length, 1);
});
