// Erinnerungskalender und Optionen.

import { escapeHtml } from './format.js';

/** Feste, „zufällige“ Anordnung der Türen wie bei einem echten Adventskalender. */
export const DOOR_ORDER = [7, 15, 1, 22, 10, 18, 3, 13, 24, 20, 5, 11, 16, 2, 9, 21, 6, 14, 19, 4, 12, 17, 8, 23];

/** Doppelt breite Türen (nur auf breiten Bildschirmen), damit das Raster aufgeht. */
export const WIDE_DOORS = [6, 13, 20];

/**
 * @param {object} options
 * @param {object[]} options.memories
 * @param {() => string[]} options.loadUnlocked
 */
export function createCalendar({ memories, loadUnlocked }) {
  const calendar = document.getElementById('calendar');
  const detail = document.getElementById('calendar-detail');
  const progress = document.getElementById('memories-progress');
  const byDoor = new Map(memories.map((m) => [m.door, m]));

  function render() {
    const unlocked = new Set(loadUnlocked());
    const opened = memories.filter((m) => unlocked.has(m.id)).length;
    const endings = memories.filter((m) => m.ending && unlocked.has(m.id)).length;
    const totalEndings = memories.filter((m) => m.ending).length;
    progress.textContent = `${opened} von ${memories.length} Türen geöffnet · ${endings} von ${totalEndings} Enden gefunden`;
    detail.replaceChildren();

    calendar.replaceChildren(
      ...DOOR_ORDER.map((door) => {
        const memory = byDoor.get(door);
        const isOpen = memory && unlocked.has(memory.id);
        const li = document.createElement('li');
        if (door === 24) li.classList.add('is-big');
        if (WIDE_DOORS.includes(door)) li.classList.add('is-wide');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'door';
        button.setAttribute('aria-pressed', 'false');
        if (memory?.ending) button.classList.add('is-ending');
        if (isOpen) {
          button.classList.add('is-open');
          button.innerHTML = `<span class="door-number">${door}</span><span class="door-icon" aria-hidden="true">${memory.icon}</span><span class="door-title">${escapeHtml(memory.title)}</span>`;
          button.setAttribute('aria-label', `Tür ${door}, geöffnet: ${memory.title}`);
        } else {
          button.innerHTML = `<span class="door-number">${door}</span>`;
          button.setAttribute('aria-label', `Tür ${door}, verschlossen`);
        }
        button.addEventListener('click', () => {
          calendar.querySelectorAll('.door[aria-pressed="true"]').forEach((d) => d.setAttribute('aria-pressed', 'false'));
          button.setAttribute('aria-pressed', 'true');
          showDetail(door, memory, isOpen);
        });
        li.append(button);
        return li;
      }),
    );
  }

  function showDetail(door, memory, isOpen) {
    if (!isOpen) {
      detail.innerHTML = `<h2>Tür ${door}</h2><p class="muted">Diese Tür ist noch verschlossen.${memory?.ending ? ' Hinter ihr wartet ein Ende der Geschichte.' : ''}</p>`;
      return;
    }
    const kind = memory.ending ? `Ende ${memory.ending}` : 'Erinnerung';
    detail.innerHTML = `<h2>${memory.icon} ${escapeHtml(memory.title)}</h2><p><span class="muted">Tür ${door} · ${kind}</span><br><em>${escapeHtml(memory.text)}</em></p>`;
  }

  return { render, count: () => new Set(loadUnlocked()).size };
}

/**
 * Bindet das Optionsformular an die Einstellungen.
 * @param {{getSettings: () => object, onChange: (patch: object) => void, onReset: () => void}} options
 */
export function createOptions({ getSettings, onChange, onReset }) {
  const form = document.getElementById('options-form');

  function render() {
    const settings = getSettings();
    for (const element of form.elements) {
      if (!element.name || !(element.name in settings)) continue;
      if (element.type === 'radio') element.checked = settings[element.name] === element.value;
      else if (element.type === 'checkbox') element.checked = Boolean(settings[element.name]);
      else if (element.type === 'range') element.value = String(settings[element.name]);
    }
    const volume = form.elements.namedItem('volume');
    if (volume) volume.disabled = !settings.sound;
  }

  form.addEventListener('change', (event) => {
    const el = event.target;
    if (!el.name) return;
    const value = el.type === 'checkbox' ? el.checked : el.type === 'range' ? Number(el.value) : el.value;
    onChange({ [el.name]: value });
    render();
  });

  form.addEventListener('input', (event) => {
    const el = event.target;
    if (el.type === 'range') onChange({ [el.name]: Number(el.value) }, { preview: true });
  });

  form.addEventListener('submit', (event) => event.preventDefault());
  form.querySelector('[data-action="reset"]').addEventListener('click', onReset);

  return { render };
}
