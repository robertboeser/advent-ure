// Deklarative Bedingungen auswerten.
//
// Eine Bedingung ist ein Objekt, dessen Schlüssel Operatoren sind. Mehrere
// Schlüssel in einem Objekt werden UND-verknüpft, ein Array ebenso.
//
//   { has: 'laterne' }                       Gegenstand vorhanden
//   { hasNot: 'laterne' }                    Gegenstand nicht vorhanden
//   { flag: 'ofen_an' }                      Flag gesetzt
//   { notFlag: 'ofen_an' }                   Flag nicht gesetzt
//   { attr: { guete: { gte: 2 } } }          Attributvergleich
//   { all: [...] } / { any: [...] }          UND / ODER
//   { not: {...} }                           Negation
//   { ref: 'kennt_legende' }                 benannte Bedingung aus der Konfiguration
//   { first: true }                          erster Besuch der aktuellen Station
//   { visited: 'stube' }                     Station schon besucht
//
// `has`, `hasNot`, `flag`, `notFlag` und `visited` akzeptieren auch Listen.

const toList = (value) => (Array.isArray(value) ? value : [value]);

const COMPARATORS = {
  eq: (a, b) => a === b,
  ne: (a, b) => a !== b,
  gt: (a, b) => a > b,
  gte: (a, b) => a >= b,
  lt: (a, b) => a < b,
  lte: (a, b) => a <= b,
};

export function compare(value, spec) {
  if (typeof spec === 'number') return value === spec;
  return Object.entries(spec).every(([op, operand]) => {
    const fn = COMPARATORS[op];
    if (!fn) throw new Error(`Unbekannter Vergleichsoperator: ${op}`);
    return fn(value, operand);
  });
}

const OPERATORS = {
  has: (v, s) => toList(v).every((id) => (s.items[id] ?? 0) > 0),
  hasNot: (v, s) => toList(v).every((id) => !((s.items[id] ?? 0) > 0)),
  flag: (v, s) => toList(v).every((f) => s.flags[f] === true),
  notFlag: (v, s) => toList(v).every((f) => s.flags[f] !== true),
  attr: (spec, s) => Object.entries(spec).every(([name, cmp]) => compare(s.attrs[name] ?? 0, cmp)),
  all: (list, s, ctx) => list.every((c) => evaluate(c, s, ctx)),
  any: (list, s, ctx) => list.some((c) => evaluate(c, s, ctx)),
  not: (c, s, ctx) => !evaluate(c, s, ctx),
  ref: (name, s, ctx) => {
    const named = ctx.conditions?.[name];
    if (!named) throw new Error(`Unbekannte benannte Bedingung: ${name}`);
    return evaluate(named, s, ctx);
  },
  first: (v, s) => ((s.visits[s.station] ?? 0) <= 1) === Boolean(v),
  visited: (v, s) => toList(v).every((id) => (s.visits[id] ?? 0) > 0),
};

export const OPERATOR_NAMES = Object.freeze(Object.keys(OPERATORS));

/**
 * Wertet eine Bedingung gegen einen Spielzustand aus.
 * @param {object|object[]|null|undefined} condition
 * @param {object} state
 * @param {{conditions?: Record<string, object>}} [ctx]
 */
export function evaluate(condition, state, ctx = {}) {
  if (condition == null) return true;
  if (Array.isArray(condition)) return condition.every((c) => evaluate(c, state, ctx));
  if (typeof condition !== 'object') {
    throw new TypeError(`Bedingung muss ein Objekt sein, erhalten: ${JSON.stringify(condition)}`);
  }
  for (const [op, value] of Object.entries(condition)) {
    const fn = OPERATORS[op];
    if (!fn) throw new Error(`Unbekannter Bedingungsoperator: ${op}`);
    if (!fn(value, state, ctx)) return false;
  }
  return true;
}

/**
 * Sammelt alle in einer Bedingung referenzierten Bezeichner (für den Validator).
 * @returns {{items:Set<string>, flags:Set<string>, attrs:Set<string>, refs:Set<string>, stations:Set<string>}}
 */
export function collectReferences(condition, acc = emptyRefs()) {
  if (condition == null) return acc;
  if (Array.isArray(condition)) {
    condition.forEach((c) => collectReferences(c, acc));
    return acc;
  }
  for (const [op, value] of Object.entries(condition)) {
    switch (op) {
      case 'has':
      case 'hasNot':
        toList(value).forEach((id) => acc.items.add(id));
        break;
      case 'flag':
      case 'notFlag':
        toList(value).forEach((f) => acc.flags.add(f));
        break;
      case 'attr':
        Object.keys(value).forEach((a) => acc.attrs.add(a));
        break;
      case 'all':
      case 'any':
        value.forEach((c) => collectReferences(c, acc));
        break;
      case 'not':
        collectReferences(value, acc);
        break;
      case 'ref':
        acc.refs.add(value);
        break;
      case 'visited':
        toList(value).forEach((id) => acc.stations.add(id));
        break;
      case 'first':
        break;
      default:
        throw new Error(`Unbekannter Bedingungsoperator: ${op}`);
    }
  }
  return acc;
}

export function emptyRefs() {
  return { items: new Set(), flags: new Set(), attrs: new Set(), refs: new Set(), stations: new Set() };
}
