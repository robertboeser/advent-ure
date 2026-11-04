import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectReferences, compare, evaluate } from '../js/engine/conditions.js';

const state = {
  station: 'stube',
  attrs: { zeit: 30, waerme: 4, guete: 2 },
  items: { laterne: 1, lebkuchen: 2 },
  flags: { ofen_an: true },
  visits: { stube: 1, kueche: 2 },
};

test('leere Bedingung ist immer wahr', () => {
  assert.equal(evaluate(undefined, state), true);
  assert.equal(evaluate(null, state), true);
  assert.equal(evaluate({}, state), true);
});

test('has / hasNot mit Einzelwert und Liste', () => {
  assert.equal(evaluate({ has: 'laterne' }, state), true);
  assert.equal(evaluate({ has: ['laterne', 'lebkuchen'] }, state), true);
  assert.equal(evaluate({ has: ['laterne', 'schal'] }, state), false);
  assert.equal(evaluate({ hasNot: 'schal' }, state), true);
  assert.equal(evaluate({ hasNot: 'laterne' }, state), false);
});

test('Gegenstand mit Anzahl 0 gilt als nicht vorhanden', () => {
  const s = { ...state, items: { laterne: 0 } };
  assert.equal(evaluate({ has: 'laterne' }, s), false);
  assert.equal(evaluate({ hasNot: 'laterne' }, s), true);
});

test('flag / notFlag', () => {
  assert.equal(evaluate({ flag: 'ofen_an' }, state), true);
  assert.equal(evaluate({ notFlag: 'ofen_an' }, state), false);
  assert.equal(evaluate({ notFlag: ['x', 'y'] }, state), true);
});

test('attr-Vergleiche', () => {
  assert.equal(evaluate({ attr: { guete: { gte: 2 } } }, state), true);
  assert.equal(evaluate({ attr: { guete: { gt: 2 } } }, state), false);
  assert.equal(evaluate({ attr: { waerme: { lte: 4, gte: 1 } } }, state), true);
  assert.equal(evaluate({ attr: { zeit: 30 } }, state), true);
  assert.equal(evaluate({ attr: { unbekannt: { eq: 0 } } }, state), true);
  assert.throws(() => compare(1, { foo: 1 }), /Vergleichsoperator/);
});

test('mehrere Schlüssel und Arrays sind UND-verknüpft', () => {
  assert.equal(evaluate({ has: 'laterne', flag: 'ofen_an' }, state), true);
  assert.equal(evaluate({ has: 'laterne', flag: 'nein' }, state), false);
  assert.equal(evaluate([{ has: 'laterne' }, { flag: 'nein' }], state), false);
});

test('all / any / not verschachtelt', () => {
  const cond = { any: [{ flag: 'nein' }, { all: [{ has: 'laterne' }, { not: { has: 'schal' } }] }] };
  assert.equal(evaluate(cond, state), true);
  assert.equal(evaluate({ not: cond }, state), false);
});

test('ref löst benannte Bedingungen auf', () => {
  const ctx = { conditions: { gut: { attr: { guete: { gte: 2 } } } } };
  assert.equal(evaluate({ ref: 'gut' }, state, ctx), true);
  assert.throws(() => evaluate({ ref: 'fehlt' }, state, ctx), /benannte Bedingung/);
});

test('first und visited', () => {
  assert.equal(evaluate({ first: true }, state), true);
  assert.equal(evaluate({ first: false }, { ...state, station: 'kueche' }), true);
  assert.equal(evaluate({ visited: 'kueche' }, state), true);
  assert.equal(evaluate({ visited: 'dachboden' }, state), false);
});

test('unbekannte Operatoren werfen', () => {
  assert.throws(() => evaluate({ foo: 1 }, state), /Bedingungsoperator/);
  assert.throws(() => evaluate('has', state), /Objekt/);
});

test('collectReferences findet alle Bezeichner', () => {
  const refs = collectReferences({
    all: [{ has: ['a', 'b'] }, { not: { flag: 'f' } }, { any: [{ attr: { guete: { gte: 1 } } }, { ref: 'r' }] }],
    visited: 's',
    hasNot: 'c',
  });
  assert.deepEqual([...refs.items].sort(), ['a', 'b', 'c']);
  assert.deepEqual([...refs.flags], ['f']);
  assert.deepEqual([...refs.attrs], ['guete']);
  assert.deepEqual([...refs.refs], ['r']);
  assert.deepEqual([...refs.stations], ['s']);
});
