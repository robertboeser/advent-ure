// Einstiegspunkt: verdrahtet Engine, Speicher und Oberfläche.

import { createEngine } from './engine/engine.js';
import { createStorage } from './engine/storage.js';
import { createRenderer } from './ui/renderer.js';
import { createTypewriter } from './ui/typewriter.js';
import { createSnow } from './fx/snow.js';
import { atmosphereFor, TITLE_ATMOSPHERE } from './fx/atmosphere.js';
import { gameData, memories } from '../data/index.js';

const engine = createEngine(gameData);
const storage = createStorage();
let settings = storage.loadSettings();

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const reducedMotion = () => motionQuery.matches || settings.reducedEffects;

const screens = {
  title: document.getElementById('screen-title'),
  game: document.getElementById('screen-game'),
};
const menuDialog = document.getElementById('menu-dialog');
const inventoryDialog = document.getElementById('inventory-dialog');
const toast = document.getElementById('toast');

let state = null;

const snow = createSnow(document.getElementById('snow'), { reducedMotion });
const flash = document.getElementById('flash');

const typewriter = createTypewriter({
  getSpeed: () => settings.textSpeed,
  reducedMotion,
  srTarget: document.getElementById('station-text-sr'),
});

const renderer = createRenderer({
  engine,
  onChoose: choose,
  onUseItem: useItem,
  onRestart: () => startNewGame(),
  onStation: (station) => snow.setMode(atmosphereFor(station)),
  presentText: typewriter.present,
  reducedMotion,
});

function applySettings() {
  document.body.classList.toggle('reduced-effects', Boolean(settings.reducedEffects));
  snow.setEnabled(!settings.reducedEffects);
}

// ------------------------------------------------------------------ Bildschirme
function showScreen(name) {
  for (const [key, section] of Object.entries(screens)) section.hidden = key !== name;
  document.body.dataset.screen = name;
}

function showTitle() {
  typewriter.skip();
  delete document.body.dataset.ending;
  document.body.dataset.climate = 'kalt';
  document.body.dataset.urgent = 'false';
  snow.setMode(TITLE_ATMOSPHERE);
  const save = storage.loadGame(engine.isValidState);
  const continueBtn = screens.title.querySelector('[data-action="continue"]');
  continueBtn.hidden = !save || engine.isEnding(save);
  showScreen('title');
  (continueBtn.hidden ? screens.title.querySelector('[data-action="new"]') : continueBtn).focus();
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

// ------------------------------------------------------------------ Spielzüge
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
  if (typewriter.active) return;
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

// ------------------------------------------------------------------ Toast
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 4000);
}

// ------------------------------------------------------------------ Ereignisse
screens.title.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'new') startNewGame();
  if (action === 'continue') continueGame();
});

// Text überspringen: Klick in den Text oder Leertaste/Enter
document.getElementById('station-text').addEventListener('click', () => typewriter.skip());

document.getElementById('btn-menu').addEventListener('click', () => menuDialog.showModal());
document.getElementById('btn-inventory').addEventListener('click', () => renderer.openInventory());

menuDialog.addEventListener('close', () => {
  const value = menuDialog.returnValue;
  menuDialog.returnValue = '';
  if (value === 'title') motionQuery.addEventListener?.('change', () => snow.refresh());

applySettings();
showTitle();
  if (value === 'restart') startNewGame();
});

document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  if (document.body.dataset.screen !== 'game') return;
  if (menuDialog.open || inventoryDialog.open) return;
  const tag = event.target?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

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

if (!storage.persistent) {
  showToast('Dein Browser erlaubt keine Speicherung – der Spielstand geht beim Schließen verloren.');
}

motionQuery.addEventListener?.('change', () => snow.refresh());

applySettings();
showTitle();
