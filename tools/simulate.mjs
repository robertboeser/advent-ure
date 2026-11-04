#!/usr/bin/env node
// Balancing-Simulator über die echte Engine.
//
//   node tools/simulate.mjs              Bericht ausgeben (Exit-Code 1, wenn Ziele verfehlt)
//   node tools/simulate.mjs --runs 50000 mehr Zufallsdurchläufe
//   node tools/simulate.mjs --trace wald Route Schritt für Schritt ausgeben
//
// Ein vollständiger Zustandsraum ist bei diesem Spiel nicht berechenbar: Die
// Bereiche lassen sich fast unabhängig voneinander kombinieren, schon vor
// 22 Uhr entstehen Millionen Zustände. Der Simulator kombiniert daher
//   1. definierte Routen (tools/routes.mjs) für Zeit- und Wärmebudget,
//   2. viele Zufallsdurchläufe, die Sackgassen, leere Texte, nie verfügbare
//      Wahlen und die Verteilung der Enden aufdecken.
// Strukturelle Softlocks prüfen gezielte Tests (tests/balancing.test.mjs).

import { pathToFileURL } from 'node:url';
import { createEngine } from '../js/engine/engine.js';
import { ROUTES } from './routes.mjs';

/** Kleiner, reproduzierbarer Zufallsgenerator (mulberry32). */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Spielt eine Route und protokolliert Zeit und Wärme.
 * @returns {{ok: boolean, error?: string, state: object, trace: object[], minWarmth: number}}
 */
export function runRoute(engine, steps) {
  let state = engine.newGame();
  const trace = [{ step: '(Start)', station: state.station, zeit: state.attrs.zeit, waerme: state.attrs.waerme }];
  let minWarmth = state.attrs.waerme;
  const states = [state];
  for (const step of steps) {
    if (engine.isEnding(state)) {
      return { ok: false, error: `vorzeitig beendet in ${state.station} vor „${step}“`, state, trace, minWarmth, states };
    }
    let result;
    if (step.startsWith('essen:')) {
      result = engine.useItem(state, step.slice(6));
    } else {
      const choice = engine.choices(state).find((c) => c.label === step && !c.locked);
      if (!choice) return { ok: false, error: `„${step}“ in ${state.station} nicht verfügbar`, state, trace, minWarmth, states };
      result = engine.choose(state, choice.index);
    }
    state = result.state;
    states.push(state);
    minWarmth = Math.min(minWarmth, state.attrs.waerme);
    trace.push({ step, station: state.station, zeit: state.attrs.zeit, waerme: state.attrs.waerme, guete: state.attrs.guete });
  }
  return { ok: true, state, trace, minWarmth, states };
}

/** Bewertet alle Routen gegen ihre Zielwerte. */
export function evaluateRoutes(engine, routes = ROUTES) {
  const results = {};
  for (const [name, route] of Object.entries(routes)) {
    const run = runRoute(engine, route.steps);
    const towerStep = run.trace.find((t) => t.station === 'glockenstube');
    const buffer = towerStep ? engine.config.midnight - towerStep.zeit : null;
    const problems = [];
    if (route.expectFailure) {
      if (run.ok && !engine.isEnding(run.state)) {
        problems.push('Route ist vollständig vor Mitternacht spielbar – „alles in einem Durchgang“ sollte nicht gehen');
      }
    } else {
      if (!run.ok) problems.push(run.error);
      else if (run.state.station !== route.expect) problems.push(`endet in ${run.state.station} statt ${route.expect}`);
      if (route.minBuffer != null && (buffer == null || buffer < route.minBuffer)) {
        problems.push(`Puffer bis Mitternacht ${buffer ?? '–'} min < ${route.minBuffer} min`);
      }
      if (route.minWarmth != null && run.minWarmth < route.minWarmth) {
        problems.push(`Wärme sinkt auf ${run.minWarmth} < ${route.minWarmth}`);
      }
    }
    results[name] = { run, buffer, problems };
  }
  return results;
}

/**
 * Zufallsdurchläufe. Die Strategie ist bewusst „neugierig, aber nicht dumm“:
 * gleichverteilt über verfügbare Wahlen, essen nur bei Wärme ≤ 3.
 * Die Hälfte der Durchläufe startet an einem zufälligen Punkt einer Route
 * (`checkpoints`), damit auch späte Stationen und das Finale abgedeckt werden.
 */
export function randomPlayouts(engine, { runs = 20000, seed = 24, maxSteps = 400, checkpoints = [] } = {}) {
  const random = rng(seed);
  const endings = {};
  const stationsSeen = new Set();
  const choicesSeen = new Set();
  const deadEnds = new Set();
  const emptyTexts = new Set();
  let stuck = 0;

  const fromStart = { endings: {}, runs: 0 };
  for (let r = 0; r < runs; r++) {
    const useCheckpoint = checkpoints.length > 0 && r % 2 === 1;
    let state = useCheckpoint ? checkpoints[Math.floor(random() * checkpoints.length)] : engine.newGame();
    let steps = 0;
    while (!engine.isEnding(state) && steps++ < maxSteps) {
      stationsSeen.add(state.station);
      if (engine.text(state).length === 0) emptyTexts.add(state.station);
      const available = engine.choices(state).filter((c) => !c.locked);
      if (available.length === 0) {
        deadEnds.add(state.station);
        break;
      }
      if (state.attrs.waerme <= 3) {
        const food = Object.keys(state.items).find((id) => engine.itemActions(state, id).length);
        if (food) {
          state = engine.useItem(state, food).state;
          continue;
        }
      }
      const pick = available[Math.floor(random() * available.length)];
      choicesSeen.add(`${state.station}#${pick.index}`);
      state = engine.choose(state, pick.index).state;
    }
    if (engine.isEnding(state)) {
      stationsSeen.add(state.station);
      endings[state.station] = (endings[state.station] ?? 0) + 1;
      if (!useCheckpoint) {
        fromStart.runs++;
        fromStart.endings[state.station] = (fromStart.endings[state.station] ?? 0) + 1;
      }
    } else {
      stuck++;
    }
  }

  const neverChosen = [];
  for (const [id, station] of engine.graph) {
    station.choices.forEach((c, index) => {
      if (!choicesSeen.has(`${id}#${index}`) && !c.showLocked) neverChosen.push(`${id}: ${c.label}`);
    });
  }
  const unreached = [...engine.graph.keys()].filter((id) => !stationsSeen.has(id));
  return { runs, endings, fromStart, stuck, deadEnds: [...deadEnds], emptyTexts: [...emptyTexts], neverChosen, unreached };
}

async function main() {
  const { gameData } = await import('../data/index.js');
  const engine = createEngine(gameData, { keepLog: false });
  const argv = process.argv.slice(2);
  const runs = Number(argv[argv.indexOf('--runs') + 1]) || 20000;
  const traceName = argv.includes('--trace') ? argv[argv.indexOf('--trace') + 1] : null;
  const clock = (minutes) => engine.formatClock(minutes);

  if (traceName) {
    const run = runRoute(engine, ROUTES[traceName].steps);
    for (const t of run.trace) {
      console.log(`${clock(t.zeit)}  W${String(t.waerme).padStart(2)}  ${t.station.padEnd(22)} ← ${t.step}`);
    }
    if (!run.ok) console.log(`✖ ${run.error}`);
    return;
  }

  let failed = false;
  console.log('Routen');
  const evaluated = evaluateRoutes(engine);
  for (const [name, { run, buffer, problems }] of Object.entries(evaluated)) {
    const end = run.state;
    console.log(`  ${problems.length ? '✖' : '✔'} ${name.padEnd(11)} → ${end.station.padEnd(20)} ${clock(end.attrs.zeit)}  `
      + `Turm-Puffer ${buffer ?? '–'} min, minimale Wärme ${run.minWarmth}, Güte ${end.attrs.guete}`);
    for (const p of problems) console.log(`      ${p}`);
    if (problems.length) failed = true;
  }

  const started = Date.now();
  const checkpoints = Object.values(evaluated).flatMap(({ run }) => (run.states ?? []).filter((s) => !engine.isEnding(s)));
  const mc = randomPlayouts(engine, { runs, checkpoints });
  console.log(`\nZufallsdurchläufe: ${mc.runs.toLocaleString('de-DE')} in ${((Date.now() - started) / 1000).toFixed(1)} s`
    + ` (die Hälfte ab ${checkpoints.length} Zwischenständen der Routen)`);
  console.log('  Enden aller Durchläufe:');
  for (const [id, count] of Object.entries(mc.endings).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${id.padEnd(22)} ${((100 * count) / mc.runs).toFixed(1).padStart(5)} %`);
  }
  console.log('  Enden bei rein zufälligem Spiel ab Start:');
  for (const [id, count] of Object.entries(mc.fromStart.endings).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${id.padEnd(22)} ${((100 * count) / mc.fromStart.runs).toFixed(1).padStart(5)} %`);
  }
  if (mc.stuck) console.log(`  ohne Ende (Schrittlimit): ${mc.stuck}`);
  const list = (title, items, fatal) => {
    if (!items.length) return console.log(`  ${title}: keine`);
    console.log(`  ${title}:`);
    items.forEach((x) => console.log(`    - ${x}`));
    if (fatal) failed = true;
  };
  list('Sackgassen', mc.deadEnds, true);
  list('Stationen mit leerem Text', mc.emptyTexts, true);
  list('Nie erreichte Stationen (zufällig)', mc.unreached, false);
  list('Nie gewählte Wahlen (zufällig)', mc.neverChosen, false);

  process.exitCode = failed ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
