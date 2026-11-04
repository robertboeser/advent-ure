#!/usr/bin/env node
// Prüft den Stationsgraphen auf Konsistenz (siehe docs/STATIONSGRAPH.md §8).
//
//   node tools/validate-graph.mjs          Bericht ausgeben, Exit-Code 1 bei Fehlern
//   node tools/validate-graph.mjs --strict Warnungen ebenfalls als Fehler werten

import { pathToFileURL } from 'node:url';
import { collectReferences, emptyRefs } from '../js/engine/conditions.js';
import { EFFECT_NAMES } from '../js/engine/effects.js';

const CLIMATES = new Set(['warm', 'mild', 'kalt', 'eisig']);

/**
 * @param {{stations: object[], items: object, config: object}} data
 * @param {object[]} memories
 * @returns {{errors: string[], warnings: string[], stats: object}}
 */
export function validate({ stations, items, config }, memories = []) {
  const errors = [];
  const warnings = [];
  const error = (msg) => errors.push(msg);
  const warn = (msg) => warnings.push(msg);

  const byId = new Map();
  for (const s of stations) {
    if (!s.id) error(`Station ohne ID: ${JSON.stringify(s).slice(0, 60)}`);
    else if (byId.has(s.id)) error(`Doppelte Stations-ID: ${s.id}`);
    else byId.set(s.id, s);
  }

  const read = emptyRefs(); // in Bedingungen gelesen
  const flagsSet = new Set();
  const itemsGiven = new Set();
  const itemsTaken = new Set();
  const memoriesUnlocked = new Set();
  const attrsChanged = new Set();

  const checkCondition = (cond, where) => {
    if (cond == null) return;
    try {
      collectReferences(cond, read);
      const refs = collectReferences(cond);
      for (const id of refs.items) if (!items[id]) error(`${where}: unbekannter Gegenstand „${id}“ in Bedingung`);
      for (const a of refs.attrs) if (!config.attrs[a]) error(`${where}: unbekanntes Attribut „${a}“ in Bedingung`);
      for (const r of refs.refs) if (!config.conditions?.[r]) error(`${where}: unbekannte benannte Bedingung „${r}“`);
      for (const st of refs.stations) if (!byId.has(st)) error(`${where}: unbekannte Station „${st}“ in Bedingung`);
    } catch (e) {
      error(`${where}: ${e.message}`);
    }
  };

  const checkEffects = (effects, where) => {
    if (!effects) return;
    for (const key of Object.keys(effects)) {
      if (!EFFECT_NAMES.includes(key)) error(`${where}: unbekannter Effekt „${key}“`);
    }
    for (const id of Object.keys(effects.give ?? {})) {
      if (!items[id]) error(`${where}: unbekannter Gegenstand „${id}“ in give`);
      itemsGiven.add(id);
    }
    for (const id of Object.keys(effects.take ?? {})) {
      if (!items[id]) error(`${where}: unbekannter Gegenstand „${id}“ in take`);
      itemsTaken.add(id);
    }
    for (const f of [].concat(effects.set ?? [])) flagsSet.add(f);
    for (const a of Object.keys(effects.attr ?? {})) {
      if (!config.attrs[a]) error(`${where}: unbekanntes Attribut „${a}“ in attr`);
      attrsChanged.add(a);
    }
    for (const m of [].concat(effects.memory ?? [])) {
      memoriesUnlocked.add(m);
      if (!memories.some((x) => x.id === m)) error(`${where}: unbekannte Erinnerung „${m}“`);
    }
  };

  // ------------------------------------------------------------ Stationen
  for (const s of byId.values()) {
    const at = `Station ${s.id}`;
    if (!s.title) error(`${at}: Titel fehlt`);
    if (!CLIMATES.has(s.climate)) error(`${at}: ungültiges Klima „${s.climate}“`);
    if (!Array.isArray(s.text) || s.text.length === 0) error(`${at}: Text fehlt`);
    else {
      s.text.forEach((p, i) => {
        if (typeof p === 'string') return;
        if (!p || typeof p.text !== 'string') error(`${at}: Absatz ${i + 1} ist weder Text noch {if, text}`);
        else checkCondition(p.if, `${at}, Absatz ${i + 1}`);
      });
      if (!s.text.some((p) => typeof p === 'string')) {
        warn(`${at}: alle Absätze sind bedingt – kann der Text leer bleiben?`);
      }
    }
    checkEffects(s.onEnter, `${at} (onEnter)`);

    if (!Array.isArray(s.choices)) {
      error(`${at}: choices fehlt`);
      continue;
    }
    if (s.ending) {
      if (s.choices.length) error(`${at}: Enden dürfen keine Wahlen haben`);
      if (typeof s.ending.number !== 'number' || !s.ending.title) error(`${at}: ending braucht number und title`);
      if (s.ending.memory) {
        memoriesUnlocked.add(s.ending.memory);
        if (!memories.some((m) => m.id === s.ending.memory)) error(`${at}: unbekannte Erinnerung „${s.ending.memory}“`);
      }
      continue;
    }
    if (s.choices.length === 0) error(`${at}: keine Wahlen und kein Ende (Sackgasse)`);

    const labels = new Set();
    for (const [i, c] of s.choices.entries()) {
      const where = `${at}, Wahl „${c.label ?? i}“`;
      if (!c.label) error(`${at}: Wahl ${i} ohne Label`);
      const key = c.id ?? c.label;
      if (labels.has(key)) error(`${where}: Label/ID doppelt in derselben Station`);
      labels.add(key);
      if (c.to != null && !byId.has(c.to)) error(`${where}: Ziel „${c.to}“ existiert nicht`);
      if (c.minutes != null && (typeof c.minutes !== 'number' || c.minutes < 0)) error(`${where}: ungültige Minuten`);
      if (c.showLocked && !c.if) warn(`${where}: showLocked ohne Bedingung`);
      if (c.showLocked && !c.hint) warn(`${where}: showLocked ohne hint`);
      checkCondition(c.if, where);
      checkEffects(c.effects, where);
    }

    const exits = s.choices.filter((c) => c.to != null && c.to !== s.id);
    if (exits.length === 0) error(`${at}: keine Wege hinaus, nur Aktionen`);
    else if (!exits.some((c) => !c.if && c.once !== true)) {
      warn(`${at}: alle Wege hinaus sind bedingt – Sackgassen-Freiheit prüft der Simulator`);
    }
  }

  // ------------------------------------------------------------ Gegenstände
  for (const [id, item] of Object.entries(items)) {
    if (!item.name) error(`Gegenstand ${id}: Name fehlt`);
    if (item.use) {
      if (!item.use.label) error(`Gegenstand ${id}: use.label fehlt`);
      checkEffects(item.use.effects, `Gegenstand ${id} (use)`);
    }
    if (!itemsGiven.has(id) && !(config.startItems ?? {})[id]) warn(`Gegenstand ${id} wird nirgends vergeben`);
  }
  for (const id of read.items) {
    if (!itemsGiven.has(id) && !(config.startItems ?? {})[id]) error(`Gegenstand „${id}“ wird abgefragt, aber nie vergeben`);
  }

  // ------------------------------------------------------------ Flags
  for (const [name, cond] of Object.entries(config.conditions ?? {})) checkCondition(cond, `Benannte Bedingung ${name}`);
  if (config.midnightGuardFlag) read.flags.add(config.midnightGuardFlag);
  for (const f of read.flags) if (!flagsSet.has(f)) error(`Flag „${f}“ wird abgefragt, aber nie gesetzt`);
  for (const f of flagsSet) if (!read.flags.has(f)) warn(`Flag „${f}“ wird gesetzt, aber nie abgefragt`);

  // ------------------------------------------------------------ Konfiguration
  if (!byId.has(config.start)) error(`Startstation „${config.start}“ fehlt`);
  for (const [kind, id] of Object.entries(config.endings ?? {})) {
    const s = byId.get(id);
    if (!s) error(`Globales Ende ${kind} → „${id}“ fehlt`);
    else if (!s.ending) error(`Globales Ende ${kind} → „${id}“ ist keine Endstation`);
  }
  for (const id of config.coldProtection ?? []) if (!items[id]) error(`coldProtection: unbekannter Gegenstand „${id}“`);

  // ------------------------------------------------------------ Erinnerungen
  const doors = new Set();
  for (const m of memories) {
    if (doors.has(m.door)) error(`Erinnerung ${m.id}: Tür ${m.door} doppelt vergeben`);
    doors.add(m.door);
    if (!memoriesUnlocked.has(m.id)) warn(`Erinnerung ${m.id} wird nirgends freigeschaltet`);
  }

  // ------------------------------------------------------------ Erreichbarkeit (ohne Bedingungen)
  const reachable = new Set();
  if (byId.has(config.start)) {
    const queue = [config.start];
    reachable.add(config.start);
    while (queue.length) {
      const s = byId.get(queue.shift());
      const targets = s.choices.filter((c) => c.to != null).map((c) => c.to);
      if (!s.ending) targets.push(...Object.values(config.endings ?? {}));
      for (const t of targets) {
        if (byId.has(t) && !reachable.has(t)) {
          reachable.add(t);
          queue.push(t);
        }
      }
    }
  }
  for (const id of byId.keys()) if (!reachable.has(id)) error(`Station ${id} ist vom Start aus nicht erreichbar`);

  const endings = [...byId.values()].filter((s) => s.ending);
  const choiceCount = [...byId.values()].reduce((n, s) => n + s.choices.length, 0);
  return {
    errors,
    warnings,
    stats: {
      stations: byId.size - endings.length,
      endings: endings.length,
      choices: choiceCount,
      items: Object.keys(items).length,
      flags: flagsSet.size,
      memories: memories.length,
    },
  };
}

async function main() {
  const strict = process.argv.includes('--strict');
  const { gameData, memories } = await import('../data/index.js');
  const { errors, warnings, stats } = validate(gameData, memories);

  console.log(`Stationsgraph: ${stats.stations} Stationen, ${stats.endings} Enden, ${stats.choices} Wahlen, `
    + `${stats.items} Gegenstände, ${stats.flags} Flags, ${stats.memories} Erinnerungen`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);
  for (const e of errors) console.log(`  ✖ ${e}`);
  const failed = errors.length > 0 || (strict && warnings.length > 0);
  console.log(failed
    ? `\n✖ ${errors.length} Fehler, ${warnings.length} Warnungen`
    : `\n✔ Keine Fehler (${warnings.length} Warnungen)`);
  process.exitCode = failed ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
