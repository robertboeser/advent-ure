import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate } from '../tools/validate-graph.mjs';
import { summarize, toMermaid } from '../tools/export-mermaid.mjs';
import { gameData, memories } from '../data/index.js';
import { data as fixture } from './fixtures.mjs';

test('die echten Spieldaten sind fehlerfrei', () => {
  const { errors } = validate(gameData, memories);
  assert.deepEqual(errors, []);
});

test('Validator erkennt typische Fehler', () => {
  const broken = {
    ...fixture,
    stations: [
      ...fixture.stations.filter((s) => s.id !== 'gut'),
      {
        id: 'kaputt',
        title: 'Kaputt',
        climate: 'lauwarm',
        text: ['x'],
        choices: [
          { label: 'A', to: 'nirgends' },
          { label: 'A', if: { has: 'zauberstab' } },
          { label: 'B', if: { flag: 'nie_gesetzt' }, effects: { zaubern: 1 } },
        ],
      },
    ],
  };
  const { errors } = validate(broken, []);
  const text = errors.join('\n');
  assert.match(text, /ungültiges Klima/);
  assert.match(text, /Ziel „nirgends“ existiert nicht/);
  assert.match(text, /Ziel „gut“ existiert nicht/);
  assert.match(text, /Label\/ID doppelt/);
  assert.match(text, /unbekannter Gegenstand „zauberstab“/);
  assert.match(text, /unbekannter Effekt „zaubern“/);
  assert.match(text, /Flag „nie_gesetzt“ wird abgefragt/);
  assert.match(text, /kaputt ist vom Start aus nicht erreichbar/);
  assert.match(text, /unbekannte Erinnerung „m_hell“/);
});

test('Sackgassen werden erkannt', () => {
  const data = {
    ...fixture,
    stations: fixture.stations.map((s) => (s.id === 'gut' ? { ...s, choices: [{ label: 'Warten' }] } : s)),
  };
  const { errors } = validate(data, [{ id: 'm_hell', door: 1 }]);
  assert.ok(errors.some((e) => e.includes('gut: keine Wege hinaus')));
});

test('Mermaid-Export enthält Knoten, Kanten und Bedingungen', () => {
  const diagram = toMermaid(fixture);
  assert.match(diagram, /^flowchart TD/);
  assert.match(diagram, /start --> draussen/);
  assert.match(diagram, /start -\.->\|"Funke"\| draussen/);
  assert.match(diagram, /hell\(\["1 Hell"\]\):::ende/);
  assert.equal(summarize({ attr: { guete: { gte: 2 } }, notFlag: 'x' }), 'guete ≥ 2 & ¬x');
});
