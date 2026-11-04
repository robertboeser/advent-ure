// Zugriff auf den Browser-Speicher.
//
// Alle Zugriffe sind abgesichert: Ist kein Speicher verfügbar (privater
// Modus, gesperrte Website-Daten, Node-Tests), arbeitet das Modul mit einem
// flüchtigen Ersatz im Arbeitsspeicher weiter und meldet `persistent: false`.

import { SAVE_VERSION } from './state.js';

export const KEYS = Object.freeze({
  save: 'adventure:save:v1',
  memories: 'adventure:memories:v1',
  settings: 'adventure:settings:v1',
});

export const DEFAULT_SETTINGS = Object.freeze({
  textSpeed: 'normal', // 'langsam' | 'normal' | 'schnell' | 'sofort'
  sound: false,
  volume: 0.6,
  reducedEffects: false,
  sessionOnly: false,
});

/** Ein Speicher im Arbeitsspeicher mit der Web-Storage-Schnittstelle. */
export function createMemoryBackend() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
  };
}

/** Liefert den Web-Storage, wenn er wirklich benutzbar ist, sonst null. */
export function probe(getBackend) {
  try {
    const backend = getBackend();
    if (!backend) return null;
    const key = '__adventure_probe__';
    backend.setItem(key, '1');
    backend.removeItem(key);
    return backend;
  } catch {
    return null;
  }
}

/** Bringt einen geladenen Spielstand auf die aktuelle Version oder verwirft ihn. */
export function migrateSave(data) {
  if (!data || typeof data !== 'object') return null;
  if (data.version === SAVE_VERSION) return data;
  // Künftige Versionen: hier schrittweise migrieren.
  return null;
}

/**
 * @param {{local?: Storage|null, session?: Storage|null}} [backends]
 *   Standard: localStorage und sessionStorage des Browsers.
 */
export function createStorage(backends = {}) {
  const local = 'local' in backends ? backends.local : probe(() => globalThis.localStorage);
  const session = 'session' in backends ? backends.session : probe(() => globalThis.sessionStorage);
  const persistent = Boolean(local);
  const localStore = local ?? createMemoryBackend();
  const sessionStore = session ?? createMemoryBackend();

  const read = (store, key) => {
    try {
      const raw = store.getItem(key);
      return raw == null ? null : JSON.parse(raw);
    } catch {
      return null;
    }
  };
  const write = (store, key, value) => {
    try {
      store.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  };
  const remove = (store, key) => {
    try {
      store.removeItem(key);
    } catch {
      /* ignorieren */
    }
  };

  function loadSettings() {
    const stored = read(localStore, KEYS.settings);
    return { ...DEFAULT_SETTINGS, ...(stored && typeof stored === 'object' ? stored : {}) };
  }

  function saveSettings(settings) {
    return write(localStore, KEYS.settings, { ...DEFAULT_SETTINGS, ...settings });
  }

  const gameStore = () => (loadSettings().sessionOnly ? sessionStore : localStore);

  /**
   * @param {(state: object) => boolean} [isValid] zusätzliche Prüfung (z. B. Station existiert)
   */
  function loadGame(isValid = () => true) {
    const data = migrateSave(read(gameStore(), KEYS.save));
    if (!data) return null;
    try {
      return isValid(data) ? data : null;
    } catch {
      return null;
    }
  }

  function saveGame(state) {
    return write(gameStore(), KEYS.save, state);
  }

  function clearGame() {
    remove(localStore, KEYS.save);
    remove(sessionStore, KEYS.save);
  }

  function loadMemories() {
    const stored = read(localStore, KEYS.memories);
    return Array.isArray(stored) ? stored.filter((id) => typeof id === 'string') : [];
  }

  /** @returns {boolean} true, wenn die Erinnerung neu ist */
  function unlockMemory(id) {
    const memories = loadMemories();
    if (memories.includes(id)) return false;
    memories.push(id);
    write(localStore, KEYS.memories, memories);
    return true;
  }

  /** Verschiebt einen laufenden Spielstand, wenn „nur diese Sitzung“ umgeschaltet wird. */
  function setSessionOnly(sessionOnly) {
    const from = sessionOnly ? localStore : sessionStore;
    const to = sessionOnly ? sessionStore : localStore;
    const save = read(from, KEYS.save);
    remove(from, KEYS.save);
    if (save) write(to, KEYS.save, save);
    return saveSettings({ ...loadSettings(), sessionOnly });
  }

  function resetAll() {
    for (const key of Object.values(KEYS)) {
      remove(localStore, key);
      remove(sessionStore, key);
    }
  }

  return {
    persistent,
    loadSettings,
    saveSettings,
    loadGame,
    saveGame,
    clearGame,
    loadMemories,
    unlockMemory,
    setSessionOnly,
    resetAll,
  };
}
