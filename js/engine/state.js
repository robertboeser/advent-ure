// Spielzustand: Initialisierung und (flaches) Kopieren.
//
// Der Zustand ist ein reines, serialisierbares Objekt. Die Engine verändert
// einen übergebenen Zustand nie, sondern arbeitet immer auf einer Kopie.

export const SAVE_VERSION = 1;

/**
 * @param {object} config Spielkonfiguration (data/config.js)
 * @param {{now?: Date}} [options]
 */
export function createInitialState(config, { now = new Date() } = {}) {
  const attrs = {};
  for (const [name, def] of Object.entries(config.attrs)) attrs[name] = def.start;
  return {
    version: SAVE_VERSION,
    station: config.start,
    attrs,
    items: { ...(config.startItems ?? {}) },
    flags: {},
    used: {},
    visits: { [config.start]: 1 },
    log: [config.start],
    startedAt: now.toISOString(),
  };
}

/** Kopiert alle veränderlichen Teile des Zustands eine Ebene tief. */
export function cloneState(state, { keepLog = true } = {}) {
  return {
    ...state,
    attrs: { ...state.attrs },
    items: { ...state.items },
    flags: { ...state.flags },
    used: { ...state.used },
    visits: { ...state.visits },
    log: keepLog && state.log ? [...state.log] : state.log,
  };
}

/** Begrenzt einen Attributwert auf den in der Konfiguration erlaubten Bereich. */
export function clampAttr(config, name, value) {
  const def = config.attrs[name];
  if (!def) throw new Error(`Unbekanntes Attribut: ${name}`);
  const min = def.min ?? -Infinity;
  const max = def.max ?? Infinity;
  return Math.min(max, Math.max(min, value));
}
