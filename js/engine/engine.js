// Der Zustandsautomat des Spiels.
//
// Die Engine kennt keine Oberfläche und keinen Speicher. Sie bekommt die
// Spieldaten (Stationen, Gegenstände, Konfiguration) und liefert für einen
// Zustand Text und Wahlmöglichkeiten bzw. für eine Wahl den Folgezustand plus
// eine Liste von Ereignissen, aus denen die Oberfläche Rückmeldungen baut.

import { evaluate } from './conditions.js';
import { applyEffects, changeAttr } from './effects.js';
import { cloneState, createInitialState, SAVE_VERSION } from './state.js';

/**
 * @param {{stations: object[], items: Record<string, object>, config: object}} data
 * @param {{keepLog?: boolean}} [options] keepLog=false spart Speicher im Simulator
 */
export function createEngine({ stations, items, config }, { keepLog = true } = {}) {
  const graph = new Map();
  for (const station of stations) {
    if (graph.has(station.id)) throw new Error(`Doppelte Stations-ID: ${station.id}`);
    graph.set(station.id, station);
  }
  if (!graph.has(config.start)) throw new Error(`Startstation fehlt: ${config.start}`);

  const ctx = { conditions: config.conditions ?? {} };

  const getStation = (id) => {
    const station = graph.get(id);
    if (!station) throw new Error(`Unbekannte Station: ${id}`);
    return station;
  };

  const isAction = (station, choice) => choice.to == null || choice.to === station.id;
  const isOnce = (station, choice) => choice.once ?? isAction(station, choice);
  const choiceKey = (station, choice) => `${station.id}#${choice.id ?? choice.label}`;
  const test = (condition, state) => evaluate(condition, state, ctx);

  function isAvailable(state, station, choice) {
    if (isOnce(station, choice) && state.used[choiceKey(station, choice)]) return false;
    if (choice.showIf && !test(choice.showIf, state)) return false;
    return test(choice.if, state);
  }

  /** Liefert die Absätze der aktuellen Station (Varianten ausgewertet). */
  function text(state) {
    const station = getStation(state.station);
    return station.text
      .filter((p) => typeof p === 'string' || test(p.if, state))
      .map((p) => (typeof p === 'string' ? p : p.text));
  }

  /**
   * Liefert die anzuzeigenden Wahlen.
   * @returns {{index:number, label:string, locked:boolean, hint?:string, minutes:number, action:boolean}[]}
   */
  function choices(state) {
    const station = getStation(state.station);
    if (station.ending) return [];
    const result = [];
    station.choices.forEach((choice, index) => {
      const used = isOnce(station, choice) && state.used[choiceKey(station, choice)];
      if (used) return;
      if (choice.showIf && !test(choice.showIf, state)) return;
      const ok = test(choice.if, state);
      if (!ok && !choice.showLocked) return;
      result.push({
        index,
        label: choice.label,
        locked: !ok,
        hint: ok ? undefined : choice.hint,
        minutes: choice.minutes ?? 0,
        action: isAction(station, choice),
      });
    });
    return result;
  }

  function enter(state, id, events) {
    const station = getStation(id);
    state.station = id;
    state.visits[id] = (state.visits[id] ?? 0) + 1;
    if (keepLog && state.log) state.log.push(id);
    events.push(...applyEffects(state, station.onEnter, config));
    if (station.ending) {
      events.push({ type: 'ending', id, number: station.ending.number, title: station.ending.title });
      if (station.ending.memory) events.push({ type: 'memory', id: station.ending.memory });
    }
    return station;
  }

  function coldLoss(state, target) {
    const base = config.climateLoss?.[target.climate] ?? 0;
    if (base <= 0) return 0;
    const protection = (config.coldProtection ?? []).filter((id) => (state.items[id] ?? 0) > 0).length;
    return Math.max(0, base - protection);
  }

  function chimes(before, after) {
    const clock = config.clock;
    if (!clock || after <= before) return [];
    const interval = clock.interval ?? 15;
    const crossed = Math.floor(after / interval);
    if (crossed <= Math.floor(before / interval)) return [];
    const minutes = crossed * interval;
    const remaining = config.midnight - minutes;
    return [{
      type: 'clock',
      minutes,
      remaining,
      text: clock.chime ? clock.chime(clock.start + minutes, remaining) : formatClock(minutes),
    }];
  }

  /**
   * Führt eine Wahl aus.
   * @param {object} state aktueller Zustand (wird nicht verändert)
   * @param {number} index Index der Wahl in `station.choices`
   * @returns {{state: object, events: object[]}}
   */
  function choose(state, index) {
    const station = getStation(state.station);
    if (station.ending) throw new Error('Das Spiel ist beendet.');
    const choice = station.choices[index];
    if (!choice) throw new Error(`Wahl ${index} existiert nicht in ${station.id}`);
    if (!isAvailable(state, station, choice)) throw new Error(`Wahl nicht verfügbar: ${choice.label}`);

    const next = cloneState(state, { keepLog });
    const events = [];
    const action = isAction(station, choice);

    if (isOnce(station, choice)) next.used[choiceKey(station, choice)] = true;

    // 1. Effekte der Wahl, Zeit
    events.push(...applyEffects(next, choice.effects, config));
    if (choice.response) events.push({ type: 'response', text: choice.response });
    if (choice.sfx) events.push({ type: 'sfx', id: choice.sfx });
    const minutes = choice.minutes ?? 0;
    const before = next.attrs.zeit;
    next.attrs.zeit += minutes;

    // 2. Kälte auf dem Weg zum Ziel
    const target = getStation(action ? station.id : choice.to);
    if (minutes > 0) {
      const loss = coldLoss(next, target);
      if (loss > 0) events.push(...changeAttr(next, config, 'waerme', -loss, 'cold'));
    }

    // 3. Ziel betreten (Aktionen bleiben auf der Station)
    if (!action) enter(next, target.id, events);
    if (target.ending) return { state: next, events };

    // 4./5. Globale Enden
    if (next.attrs.waerme <= 0 && config.endings?.freeze) {
      enter(next, config.endings.freeze, events);
      return { state: next, events };
    }
    if (next.attrs.zeit >= config.midnight && config.endings?.midnight && !next.flags[config.midnightGuardFlag]) {
      enter(next, config.endings.midnight, events);
      return { state: next, events };
    }

    // 6. Kirchturmuhr
    events.push(...chimes(before, next.attrs.zeit));
    return { state: next, events };
  }

  /** Aktionen, die ein Gegenstand im Inventar anbietet (z. B. „Essen“). */
  function itemActions(state, itemId) {
    const item = items[itemId];
    const station = getStation(state.station);
    if (!item?.use || station.ending || !((state.items[itemId] ?? 0) > 0)) return [];
    return [{ label: item.use.label }];
  }

  function useItem(state, itemId) {
    if (itemActions(state, itemId).length === 0) throw new Error(`Gegenstand nicht benutzbar: ${itemId}`);
    const next = cloneState(state, { keepLog });
    const events = applyEffects(next, items[itemId].use.effects, config);
    if (items[itemId].use.response) events.push({ type: 'response', text: items[itemId].use.response });
    return { state: next, events };
  }

  /** Prüft, ob ein geladener Spielstand zu diesen Spieldaten passt. */
  function isValidState(state) {
    return Boolean(
      state
        && state.version === SAVE_VERSION
        && typeof state.station === 'string'
        && graph.has(state.station)
        && state.attrs && typeof state.attrs.zeit === 'number' && typeof state.attrs.waerme === 'number'
        && state.items && typeof state.items === 'object'
        && state.flags && typeof state.flags === 'object'
        && state.used && typeof state.used === 'object'
        && state.visits && typeof state.visits === 'object',
    );
  }

  function formatClock(minutes) {
    const abs = (config.clock?.start ?? 0) + minutes;
    const h = Math.floor(abs / 60) % 24;
    const m = abs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  return {
    config,
    items,
    graph,
    newGame: (options) => createInitialState(config, options),
    station: (state) => getStation(state.station),
    getStation,
    isEnding: (state) => Boolean(getStation(state.station).ending),
    text,
    choices,
    choose,
    itemActions,
    useItem,
    isValidState,
    formatClock,
    evaluate: test,
  };
}
