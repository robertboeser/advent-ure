// Effekte auf einen (bereits kopierten) Zustand anwenden.
//
//   { give: { lebkuchen: 3 } }        Gegenstände hinzufügen
//   { take: { lebkuchen: 1 } }        Gegenstände entfernen (nie unter 0)
//   { set: ['ofen_an'] }              Flags setzen
//   { unset: ['ofen_an'] }            Flags löschen
//   { attr: { waerme: 2 } }           Attribute relativ ändern (mit Begrenzung)
//   { memory: 'tee' }                 Erinnerung freischalten (nur Ereignis)
//
// Die Funktion verändert `state` direkt. Aufrufer übergeben deshalb immer
// eine Kopie. Rückgabe ist eine Liste von Ereignissen für die Oberfläche.

import { clampAttr } from './state.js';

const toList = (value) => (Array.isArray(value) ? value : [value]);

export const EFFECT_NAMES = Object.freeze(['give', 'take', 'set', 'unset', 'attr', 'memory']);

/**
 * @param {object} state veränderliche Kopie des Zustands
 * @param {object|undefined} effects
 * @param {object} config
 * @returns {object[]} Ereignisse
 */
export function applyEffects(state, effects, config) {
  const events = [];
  if (!effects) return events;

  for (const key of Object.keys(effects)) {
    if (!EFFECT_NAMES.includes(key)) throw new Error(`Unbekannter Effekt: ${key}`);
  }

  if (effects.take) {
    for (const [id, amount] of Object.entries(effects.take)) {
      const have = state.items[id] ?? 0;
      const removed = Math.min(have, amount);
      if (have - removed > 0) state.items[id] = have - removed;
      else delete state.items[id];
      if (removed > 0) events.push({ type: 'item', id, delta: -removed });
    }
  }

  if (effects.give) {
    for (const [id, amount] of Object.entries(effects.give)) {
      state.items[id] = (state.items[id] ?? 0) + amount;
      events.push({ type: 'item', id, delta: amount });
    }
  }

  if (effects.set) for (const flag of toList(effects.set)) state.flags[flag] = true;
  if (effects.unset) for (const flag of toList(effects.unset)) delete state.flags[flag];

  if (effects.attr) {
    for (const [name, delta] of Object.entries(effects.attr)) {
      events.push(...changeAttr(state, config, name, delta));
    }
  }

  if (effects.memory) {
    for (const id of toList(effects.memory)) events.push({ type: 'memory', id });
  }

  return events;
}

/** Ändert ein Attribut relativ und liefert ein Ereignis mit der tatsächlichen Änderung. */
export function changeAttr(state, config, name, delta, reason) {
  const before = state.attrs[name] ?? 0;
  const after = clampAttr(config, name, before + delta);
  state.attrs[name] = after;
  if (after === before) return [];
  const event = { type: 'attr', id: name, delta: after - before };
  if (reason) event.reason = reason;
  return [event];
}
