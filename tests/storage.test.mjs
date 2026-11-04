import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryBackend, createStorage, DEFAULT_SETTINGS, KEYS, migrateSave, probe } from '../js/engine/storage.js';
import { createEngine } from '../js/engine/engine.js';
import { data } from './fixtures.mjs';

const engine = createEngine(data);
const make = () => {
  const local = createMemoryBackend();
  const session = createMemoryBackend();
  return { local, session, storage: createStorage({ local, session }) };
};

test('Spielstand speichern und laden', () => {
  const { storage } = make();
  assert.equal(storage.persistent, true);
  assert.equal(storage.loadGame(), null);
  const s = engine.newGame();
  storage.saveGame(s);
  assert.deepEqual(storage.loadGame(engine.isValidState), s);
  storage.clearGame();
  assert.equal(storage.loadGame(), null);
});

test('defekte oder fremde Daten werden verworfen', () => {
  const { local, storage } = make();
  local.setItem(KEYS.save, '{kaputt');
  assert.equal(storage.loadGame(), null);
  local.setItem(KEYS.save, JSON.stringify({ version: 1, station: 'gibtsnicht' }));
  assert.equal(storage.loadGame(engine.isValidState), null);
  local.setItem(KEYS.save, JSON.stringify({ ...engine.newGame(), version: 0 }));
  assert.equal(storage.loadGame(engine.isValidState), null);
  assert.equal(storage.loadGame(() => { throw new Error('x'); }), null);
});

test('migrateSave', () => {
  assert.equal(migrateSave(null), null);
  assert.equal(migrateSave('x'), null);
  assert.deepEqual(migrateSave({ version: 1, a: 1 }), { version: 1, a: 1 });
  assert.equal(migrateSave({ version: 2 }), null);
});

test('Einstellungen haben Standardwerte und werden zusammengeführt', () => {
  const { local, storage } = make();
  assert.deepEqual(storage.loadSettings(), DEFAULT_SETTINGS);
  storage.saveSettings({ sound: true });
  assert.equal(storage.loadSettings().sound, true);
  assert.equal(storage.loadSettings().textSpeed, 'normal');
  local.setItem(KEYS.settings, '"unsinn"');
  assert.deepEqual(storage.loadSettings(), DEFAULT_SETTINGS);
});

test('Erinnerungen bleiben erhalten und werden nicht doppelt gezählt', () => {
  const { local, storage } = make();
  assert.deepEqual(storage.loadMemories(), []);
  assert.equal(storage.unlockMemory('tee'), true);
  assert.equal(storage.unlockMemory('tee'), false);
  assert.equal(storage.unlockMemory('ofen'), true);
  assert.deepEqual(createStorage({ local, session: createMemoryBackend() }).loadMemories(), ['tee', 'ofen']);
});

test('„nur diese Sitzung“ verschiebt den Spielstand in den Session Storage', () => {
  const { local, session, storage } = make();
  const s = engine.newGame();
  storage.saveGame(s);
  storage.setSessionOnly(true);
  assert.equal(local.getItem(KEYS.save), null);
  assert.ok(session.getItem(KEYS.save));
  assert.deepEqual(storage.loadGame(), s);
  storage.saveGame({ ...s, station: 'eis' });
  assert.equal(local.getItem(KEYS.save), null);
  storage.setSessionOnly(false);
  assert.equal(storage.loadGame().station, 'eis');
  assert.equal(session.getItem(KEYS.save), null);
});

test('resetAll löscht alles', () => {
  const { storage } = make();
  storage.saveGame(engine.newGame());
  storage.unlockMemory('x');
  storage.saveSettings({ sound: true });
  storage.resetAll();
  assert.equal(storage.loadGame(), null);
  assert.deepEqual(storage.loadMemories(), []);
  assert.deepEqual(storage.loadSettings(), DEFAULT_SETTINGS);
});

test('ohne verfügbaren Speicher läuft alles im Arbeitsspeicher', () => {
  const storage = createStorage({ local: null, session: null });
  assert.equal(storage.persistent, false);
  storage.saveGame(engine.newGame());
  assert.ok(storage.loadGame());
});

test('werfende Speicher-Backends werden abgefangen', () => {
  const throwing = {
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('QuotaExceeded'); },
    removeItem() { throw new Error('SecurityError'); },
  };
  assert.equal(probe(() => throwing), null);
  assert.equal(probe(() => { throw new Error('kein Zugriff'); }), null);
  const storage = createStorage({ local: throwing, session: throwing });
  assert.equal(storage.saveGame(engine.newGame()), false);
  assert.equal(storage.loadGame(), null);
  assert.doesNotThrow(() => storage.resetAll());
});
