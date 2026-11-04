#!/usr/bin/env node
// Erzeugt ein Mermaid-Flussdiagramm aus den Spieldaten.
//
//   node tools/export-mermaid.mjs           Diagramm auf stdout
//   node tools/export-mermaid.mjs --write   nach docs/STATIONSGRAPH-GENERIERT.md schreiben

import { writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AREA_TITLES = {
  ankunft: 'Ankunft',
  haus: 'Omas Haus',
  dorf: 'Dorfplatz',
  kirche: 'Kirche',
  muehle: 'Mühle',
  wald: 'Wald',
  turm: 'Glockenturm',
  ende: 'Enden',
};

/** Kurzbeschreibung einer Bedingung für Kantenbeschriftungen. */
export function summarize(cond, items = {}) {
  if (cond == null) return '';
  if (Array.isArray(cond)) return cond.map((c) => summarize(c, items)).join(' & ');
  const list = (v) => (Array.isArray(v) ? v : [v]);
  const name = (id) => items[id]?.name ?? id;
  const parts = [];
  for (const [op, v] of Object.entries(cond)) {
    switch (op) {
      case 'has': parts.push(...list(v).map(name)); break;
      case 'hasNot': parts.push(...list(v).map((id) => `ohne ${name(id)}`)); break;
      case 'flag': parts.push(...list(v)); break;
      case 'notFlag': parts.push(...list(v).map((f) => `¬${f}`)); break;
      case 'attr':
        for (const [a, cmp] of Object.entries(v)) {
          const sym = { gte: '≥', lte: '≤', gt: '>', lt: '<', eq: '=', ne: '≠' };
          if (typeof cmp === 'number') parts.push(`${a} = ${cmp}`);
          else for (const [k, n] of Object.entries(cmp)) parts.push(`${a} ${sym[k]} ${n}`);
        }
        break;
      case 'all': parts.push(v.map((c) => summarize(c, items)).join(' & ')); break;
      case 'any': parts.push(`(${v.map((c) => summarize(c, items)).join(' / ')})`); break;
      case 'not': parts.push(`nicht (${summarize(v, items)})`); break;
      case 'ref': parts.push(v); break;
      case 'first': parts.push(v ? 'erster Besuch' : 'nicht erster Besuch'); break;
      case 'visited': parts.push(...list(v).map((s) => `war in ${s}`)); break;
      default: parts.push(op);
    }
  }
  return parts.join(' & ');
}

const esc = (text) => text.replace(/"/g, "'").replace(/[|]/g, '/');

export function toMermaid({ stations, items, config }) {
  const lines = ['flowchart TD'];
  lines.push('    classDef ende fill:#2b1d3a,stroke:#e8c66a,color:#fff');
  lines.push('    classDef start fill:#1d3a2b,stroke:#e8c66a,color:#fff');

  const areas = new Map();
  for (const s of stations) {
    const area = s.ending ? 'ende' : (s.area ?? 'sonstige');
    if (!areas.has(area)) areas.set(area, []);
    areas.get(area).push(s);
  }
  for (const [area, list] of areas) {
    lines.push('', `    subgraph ${area}["${AREA_TITLES[area] ?? area}"]`);
    for (const s of list) {
      const label = esc(s.ending ? `${s.ending.number} ${s.title}` : s.id);
      const shape = s.ending || s.id === config.start ? `(["${label}"])` : `["${label}"]`;
      const cls = s.ending ? ':::ende' : s.id === config.start ? ':::start' : '';
      lines.push(`        ${s.id}${shape}${cls}`);
    }
    lines.push('    end');
  }

  lines.push('');
  for (const s of stations) {
    const seen = new Set();
    for (const c of s.choices) {
      if (c.to == null || c.to === s.id) continue;
      const cond = summarize(c.if, items);
      const key = `${c.to}|${cond}`;
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(cond ? `    ${s.id} -.->|"${esc(cond)}"| ${c.to}` : `    ${s.id} --> ${c.to}`);
    }
  }
  return lines.join('\n');
}

async function main() {
  const { gameData } = await import('../data/index.js');
  const diagram = toMermaid(gameData);
  if (process.argv.includes('--write')) {
    const target = fileURLToPath(new URL('../docs/STATIONSGRAPH-GENERIERT.md', import.meta.url));
    const content = `# Stationsgraph (generiert)\n\n`
      + `Automatisch aus \`data/\` erzeugt mit \`npm run graph -- --write\`. Nicht von Hand bearbeiten.\n`
      + `Gestrichelte Kanten haben eine Bedingung, Aktionen (↺) sind nicht eingezeichnet. `
      + `Die globalen Enden (Schneeschlaf, Zu spät) sind von jeder Station aus erreichbar.\n\n`
      + '```mermaid\n' + diagram + '\n```\n';
    writeFileSync(target, content);
    console.log(`Geschrieben: ${target}`);
  } else {
    console.log(diagram);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
