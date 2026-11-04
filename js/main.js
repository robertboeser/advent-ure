// Einstiegspunkt: verdrahtet Engine, Speicher, Oberfläche und Effekte.

import { createEngine } from './engine/engine.js';
import { createStorage } from './engine/storage.js';
import { createRenderer } from './ui/renderer.js';
import { createTypewriter } from './ui/typewriter.js';
import { createCalendar, createOptions } from './ui/menu.js';
import { createSnow } from './fx/snow.js';
import { atmosphereFor, TITLE_ATMOSPHERE } from './fx/atmosphere.js';
import { gameData, memories } from '../data/index.js';

const engine = createEngine(gameData);
const storage = createStorage();
let settings = storage.loadSettings();
let state = null;

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const reducedMotion = () => motionQuery.matches || Boolean(settings.reducedEffects);

const $ = (id) => document.getElementById(id);
const screens = {
  title: $('screen-title'),
  game: $('screen-game'),
  memories: $('screen-memories'),
  options: $('screen-options'),
  about: $('screen-about'),
};
const menuDialog = $('menu-dialog');
const inventoryDialog = $('inventory-dialog');
const confirmDialog = $('confirm-dialog');
const toast = $('toast');
const flash = $('flash');

// ------------------------------------------------------------------ Bausteine
const snow = createSnow($('snow'), { reducedMotion });

const typewriter = createTypewriter({
  getSpeed: () => settings.textSpeed,
  reducedMotion,
  srTarget: $('station-text-sr'),
});

const renderer = createRenderer({
  engine,
  onChoose: choose,
  onUseItem: useItem,
  onRestart: () => startNewGame(),
  onMemories: () => openPage('memories'),
  onStation: (station) => snow.setMode(atmosphereFor(station)),
  presentText: typewriter.present,
  reducedMotion,
});

const calendar = createCalendar({ memories, loadUnlocked: storage.loadMemories });

const options = createOptions({
  getSettings: () => settings,
  onChange: (patch) => updateSettings(patch),
  onReset: resetEverything,
});

// ------------------------------------------------------------------ Einstellungen
function updateSettings(patch) {
  if ('sessionOnly' in patch && patch.sessionOnly !== settings.sessionOnly) {
    storage.setSessionOnly(patch.sessionOnly);
  }
  settings = { ...settings, ...patch };
  storage.saveSettings(settings);
  applySettings();
}

function applySettings() {
  document.body.classList.toggle('reduced-effects', Boolean(settings.reducedEffects));
  snow.setEnabled(!settings.reducedEffects);
}

// ------------------------------------------------------------------ Bildschirme
let currentScreen = 'title';
let returnTo = 'title';

function showScreen(name) {
  for (const [key, section] of Object.entries(screens)) section.hidden = key !== name;
  document.body.dataset.screen = name;
  currentScreen = name;
  window.scrollTo({ top: 0 });
}

function resetMood() {
  typewriter.skip();
  delete document.body.dataset.ending;
  document.body.dataset.climate = 'kalt';
  document.body.dataset.area = '';
  document.body.dataset.urgent = 'false';
  snow.setMode(TITLE_ATMOSPHERE);
}

function hasRunningGame() {
  const save = storage.loadGame(engine.isValidState);
  return Boolean(save && !engine.isEnding(save));
}

function showTitle() {
  resetMood();
  const continueBtn = screens.title.querySelector('[data-action="continue"]');
  continueBtn.hidden = !hasRunningGame();
  const count = calendar.count();
  screens.title.querySelector('[data-memory-count]').textContent = count ? `(${count}/24)` : '';
  $('storage-warning').hidden = storage.persistent;
  showScreen('title');
  (continueBtn.hidden ? screens.title.querySelector('[data-action="new"]') : continueBtn).focus();
}

/** Öffnet eine Menüseite und merkt sich, wohin „Zurück“ führt. */
function openPage(name) {
  returnTo = currentScreen === 'game' || currentScreen === 'title' ? currentScreen : returnTo;
  if (name === 'memories') calendar.render();
  if (name === 'options') options.render();
  if (returnTo === 'game' && engine.isEnding(state)) resetMood();
  showScreen(name);
  screens[name].querySelector('h1')?.setAttribute('tabindex', '-1');
  screens[name].querySelector('h1')?.focus();
}

function goBack() {
  if (returnTo === 'game' && state && !engine.isEnding(state)) {
    showScreen('game');
    renderer.render(state, [], { kind: 'refresh', animate: false });
  } else {
    showTitle();
  }
}

// ------------------------------------------------------------------ Spielablauf
async function requestNewGame() {
  if (hasRunningGame()) {
    const ok = await confirm('Ein Spiel läuft bereits. Möchtest du wirklich von vorn beginnen? Der bisherige Spielstand geht verloren.', 'Neu beginnen');
    if (!ok) return;
  }
  startNewGame();
}

function startNewGame() {
  renderer.reset();
  state = engine.newGame();
  storage.saveGame(state);
  showScreen('game');
  renderer.render(state, [], { kind: 'enter' });
}

function continueGame() {
  const save = storage.loadGame(engine.isValidState);
  if (!save) return startNewGame();
  state = save;
  renderer.reset();
  showScreen('game');
  renderer.render(state, [], { kind: 'enter', animate: false });
}

function handleEvents(events) {
  for (const event of events) {
    if (event.type === 'ending' && (event.number === 1 || event.number === 2) && !reducedMotion()) {
      flash.classList.remove('is-active');
      void flash.offsetWidth; // Animation neu starten
      flash.classList.add('is-active');
    }
    if (event.type === 'memory' && storage.unlockMemory(event.id)) {
      const memory = memories.find((m) => m.id === event.id);
      if (memory) showToast(`Erinnerung gefunden – Tür ${memory.door}: ${memory.title}`);
    }
  }
}

function choose(index) {
  if (typewriter.active || !state) return;
  const before = engine.station(state);
  const choice = before.choices[index];
  const result = engine.choose(state, index);
  state = result.state;
  storage.saveGame(state);
  handleEvents(result.events);
  const isAction = !engine.isEnding(state) && state.station === before.id && (choice.to == null || choice.to === before.id);
  renderer.render(state, result.events, { kind: isAction ? 'action' : 'enter' });
  if (isAction) renderer.focusFirstChoice();
}

function useItem(itemId) {
  const result = engine.useItem(state, itemId);
  state = result.state;
  storage.saveGame(state);
  handleEvents(result.events);
  renderer.render(state, result.events, { kind: 'action' });
}

// ------------------------------------------------------------------ Dialoge & Hinweise
function confirm(text, okLabel = 'Ja') {
  $('confirm-text').textContent = text;
  $('confirm-ok').textContent = okLabel;
  confirmDialog.returnValue = '';
  confirmDialog.showModal();
  return new Promise((resolve) => {
    confirmDialog.addEventListener('close', () => resolve(confirmDialog.returnValue === 'ok'), { once: true });
  });
}

async function resetEverything() {
  const ok = await confirm('Spielstand, alle Erinnerungen im Kalender und alle Einstellungen werden gelöscht. Das lässt sich nicht rückgängig machen.', 'Alles löschen');
  if (!ok) return;
  storage.resetAll();
  settings = storage.loadSettings();
  state = null;
  applySettings();
  options.render();
  showToast('Alles zurückgesetzt. Der Schnee fällt wie am ersten Abend.');
}

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 4200);
}

// ------------------------------------------------------------------ Ereignisse
document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  switch (action) {
    case 'new': requestNewGame(); break;
    case 'continue': continueGame(); break;
    case 'memories': openPage('memories'); break;
    case 'options': openPage('options'); break;
    case 'about': openPage('about'); break;
    case 'back': goBack(); break;
    default: break;
  }
});

// Text überspringen: Klick in den Text
$('station-text').addEventListener('click', () => typewriter.skip());

$('btn-menu').addEventListener('click', () => menuDialog.showModal());
$('btn-inventory').addEventListener('click', () => renderer.openInventory());

menuDialog.addEventListener('close', async () => {
  const value = menuDialog.returnValue;
  menuDialog.returnValue = '';
  if (value === 'title') showTitle();
  if (value === 'memories') openPage('memories');
  if (value === 'options') openPage('options');
  if (value === 'restart') {
    const ok = await confirm('Wirklich von vorn beginnen? Der aktuelle Spielstand geht verloren.', 'Neu beginnen');
    if (ok) startNewGame();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  if (menuDialog.open || inventoryDialog.open || confirmDialog.open) return;
  const tag = event.target?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  if (currentScreen !== 'game') {
    if (event.key === 'Escape' && currentScreen !== 'title') {
      event.preventDefault();
      goBack();
    }
    return;
  }

  if (typewriter.active && (event.key === ' ' || event.key === 'Enter' || /^[1-9]$/.test(event.key))) {
    event.preventDefault();
    typewriter.skip();
    return;
  }

  if (/^[1-9]$/.test(event.key)) {
    const button = document.querySelector(`#choices button[data-number="${event.key}"]`);
    if (button) {
      event.preventDefault();
      button.click();
    }
  } else if (event.key === 'i' || event.key === 'I') {
    event.preventDefault();
    renderer.openInventory();
  } else if (event.key === 'm' || event.key === 'M') {
    event.preventDefault();
    menuDialog.showModal();
  }
});

motionQuery.addEventListener?.('change', () => snow.refresh());

applySettings();
showTitle();
