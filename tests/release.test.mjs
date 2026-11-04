// Release-Prüfungen: Service-Worker-Liste vollständig, Versionen konsistent.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const sw = readFileSync(join(root, 'sw.js'), 'utf8');
const assets = JSON.parse(`[${sw.match(/const ASSETS = \[([\s\S]*?)\];/)[1].replace(/'/g, '"').replace(/,\s*$/, '')}]`);

function walk(dir) {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const path = join(dir, name);
    return statSync(join(root, path)).isDirectory() ? walk(path) : [relative('.', path)];
  });
}

test('Service Worker listet jede Laufzeitdatei', () => {
  const runtime = [
    'index.html',
    'manifest.webmanifest',
    ...walk('css'),
    ...walk('js'),
    ...walk('data'),
    ...walk('assets').filter((f) => /\.(woff2|svg|png)$/.test(f)),
  ];
  for (const file of runtime) assert.ok(assets.includes(file), `fehlt in sw.js: ${file}`);
});

test('jede Datei aus sw.js existiert', () => {
  for (const file of assets) {
    if (file === './') continue;
    assert.ok(existsSync(join(root, file)), `existiert nicht: ${file}`);
  }
});

test('Cache-Version entspricht package.json', () => {
  const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.match(sw, new RegExp(`const VERSION = '${version.replace(/\./g, '\\.')}'`));
});

test('index.html lädt keine externen Ressourcen', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
  for (const url of urls) assert.ok(!/^https?:\/\//.test(url), `externe Ressource: ${url}`);
});

test('CSS lädt keine externen Ressourcen', () => {
  for (const file of walk('css')) {
    const css = readFileSync(join(root, file), 'utf8');
    assert.ok(!/url\(\s*["']?https?:/.test(css), `externe URL in ${file}`);
    assert.ok(!/@import/.test(css), `@import in ${file}`);
  }
});

test('modulepreload deckt alle Module ab', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const preloaded = [...html.matchAll(/rel="modulepreload" href="([^"]+)"/g)].map((m) => m[1]);
  const modules = [...walk('js'), ...walk('data')].filter((f) => f !== 'js/main.js');
  for (const file of modules) assert.ok(preloaded.includes(file), `kein modulepreload für ${file}`);
});
