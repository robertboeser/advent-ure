// Zeichnet den Spielzustand in den Spielbildschirm.

import { describeEvents, formatInline, warmthLabel } from './format.js';

const NOTE_ORDER = ['clock', 'response', 'cold', 'warm', 'gain', 'loss'];

/** Standard-Textausgabe ohne Animation. */
export function instantText(container, paragraphs) {
  container.innerHTML = paragraphs.map((p) => `<p>${formatInline(p)}</p>`).join('');
  return Promise.resolve();
}

/**
 * @param {object} options
 * @param {ReturnType<import('../engine/engine.js').createEngine>} options.engine
 * @param {(index: number) => void} options.onChoose
 * @param {(itemId: string) => void} options.onUseItem
 * @param {() => void} options.onRestart
 * @param {() => void} [options.onMemories]
 * @param {(container: HTMLElement, paragraphs: string[], opts: object) => Promise<void>} [options.presentText]
 */
export function createRenderer({ engine, onChoose, onUseItem, onRestart, onMemories, presentText = instantText }) {
  const $ = (id) => document.getElementById(id);
  const el = {
    title: $('station-title'),
    notesTop: $('notes-top'),
    text: $('station-text'),
    notesBottom: $('notes-bottom'),
    choices: $('choices'),
    clock: $('clock'),
    warmth: $('warmth'),
    warmthPips: $('warmth-pips'),
    warmthLabel: $('warmth-label'),
    pockets: $('pockets-list'),
    inventoryDialog: $('inventory-dialog'),
    inventoryList: $('inventory-list'),
    inventoryEmpty: $('inventory-empty'),
  };

  let currentState = null;
  let renderToken = 0;

  // ---------------------------------------------------------------- Notizen
  function renderNotes(container, notes) {
    container.replaceChildren();
    notes
      .sort((a, b) => NOTE_ORDER.indexOf(a.kind) - NOTE_ORDER.indexOf(b.kind))
      .forEach((note) => {
        const p = document.createElement('p');
        p.className = `note note-${note.kind}`;
        p.innerHTML = formatInline(note.text);
        container.append(p);
      });
  }

  // ---------------------------------------------------------------- Status
  function renderStatus(state) {
    const { config } = engine;
    el.clock.textContent = engine.formatClock(state.attrs.zeit);
    el.clock.dateTime = el.clock.textContent;
    const remaining = config.midnight - state.attrs.zeit;
    document.body.dataset.urgent = String(remaining <= 30 && !engine.isEnding(state));

    const warmth = state.attrs.waerme;
    const max = config.attrs.waerme.max;
    const label = warmthLabel(config, warmth);
    el.warmthPips.replaceChildren(
      ...Array.from({ length: max }, (_, i) => {
        const pip = document.createElement('span');
        pip.className = i < warmth ? 'pip on' : 'pip';
        return pip;
      }),
    );
    el.warmthLabel.textContent = label;
    el.warmth.setAttribute('aria-label', `Wärme: ${warmth} von ${max}, ${label}`);
    el.warmth.dataset.level = warmth <= 2 ? 'critical' : warmth <= 4 ? 'low' : 'ok';
    document.documentElement.style.setProperty('--warmth', String(warmth / max));
  }

  // ---------------------------------------------------------------- Inventar
  function inventoryEntries(state) {
    return Object.entries(state.items)
      .filter(([, n]) => n > 0)
      .map(([id, count]) => ({ id, count, item: engine.items[id] ?? { name: id } }));
  }

  function renderPockets(state) {
    const entries = inventoryEntries(state);
    el.pockets.replaceChildren(
      ...entries.map(({ id, count, item }) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pocket-chip';
        btn.dataset.item = id;
        btn.title = item.name;
        btn.innerHTML = `<span aria-hidden="true">${item.icon ?? '•'}</span><span class="pocket-name">${formatInline(item.name)}</span>${count > 1 ? `<span class="pocket-count">×${count}</span>` : ''}`;
        btn.addEventListener('click', () => openInventory(id));
        li.append(btn);
        return li;
      }),
    );
    if (el.inventoryDialog.open) renderInventory(state);
  }

  function renderInventory(state, focusId) {
    const entries = inventoryEntries(state);
    el.inventoryEmpty.hidden = entries.length > 0;
    el.inventoryList.replaceChildren(
      ...entries.map(({ id, count, item }) => {
        const li = document.createElement('li');
        li.className = 'inventory-item';
        li.dataset.item = id;
        const actions = engine.itemActions(state, id);
        li.innerHTML = `
          <span class="inventory-icon" aria-hidden="true">${item.icon ?? '•'}</span>
          <div class="inventory-body">
            <h3 class="inventory-name">${formatInline(item.name)}${count > 1 ? ` <span class="pocket-count">×${count}</span>` : ''}</h3>
            <p class="inventory-desc">${formatInline(item.description ?? '')}</p>
          </div>`;
        if (actions.length) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'btn btn-small';
          btn.textContent = actions[0].label;
          btn.addEventListener('click', () => onUseItem(id));
          li.querySelector('.inventory-body').append(btn);
        }
        return li;
      }),
    );
    if (focusId) {
      const target = el.inventoryList.querySelector(`[data-item="${focusId}"] button`)
        ?? el.inventoryList.querySelector(`[data-item="${focusId}"]`);
      target?.scrollIntoView({ block: 'nearest' });
      if (target?.tagName === 'BUTTON') target.focus();
    }
  }

  function openInventory(focusId) {
    if (!currentState) return;
    renderInventory(currentState, focusId);
    if (!el.inventoryDialog.open) el.inventoryDialog.showModal();
    if (focusId) renderInventory(currentState, focusId);
  }

  // ---------------------------------------------------------------- Wahlen
  function renderChoices(state) {
    el.choices.replaceChildren();
    if (engine.isEnding(state)) {
      const ending = engine.station(state).ending;
      el.choices.setAttribute('aria-label', `Ende ${ending.number}`);
      const items = [
        { label: 'Noch einmal beginnen', handler: onRestart },
        onMemories && { label: 'Zum Erinnerungskalender', handler: onMemories },
      ].filter(Boolean);
      items.forEach(({ label, handler }, i) => el.choices.append(choiceItem(i + 1, label, handler)));
      return;
    }
    el.choices.setAttribute('aria-label', 'Was tust du?');
    let number = 0;
    for (const choice of engine.choices(state)) {
      const li = choiceItem(choice.locked ? null : ++number, choice.label, () => onChoose(choice.index), choice);
      el.choices.append(li);
    }
  }

  function choiceItem(number, label, handler, choice = {}) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice';
    if (choice.action) btn.classList.add('choice-action');
    if (choice.locked) {
      btn.classList.add('choice-locked');
      btn.setAttribute('aria-disabled', 'true');
    } else {
      btn.dataset.number = String(number);
      btn.addEventListener('click', handler, { once: true });
    }
    const meta = choice.minutes ? `<span class="choice-meta" aria-label="dauert ${choice.minutes} Minuten">${choice.minutes} Min.</span>` : '';
    const hint = choice.locked && choice.hint ? `<span class="choice-hint">${formatInline(choice.hint)}</span>` : '';
    btn.innerHTML = `<span class="choice-number" aria-hidden="true">${number ?? '·'}</span><span class="choice-label">${formatInline(label)}${hint}</span>${meta}`;
    li.append(btn);
    return li;
  }

  // ---------------------------------------------------------------- Gesamt
  /**
   * @param {object} state
   * @param {object[]} [events]
   * @param {{kind?: 'enter'|'action'|'refresh', animate?: boolean}} [options]
   */
  async function render(state, events = [], { kind = 'enter', animate = true } = {}) {
    const token = ++renderToken;
    currentState = state;
    const station = engine.station(state);
    document.body.dataset.climate = station.climate;
    document.body.dataset.area = station.area ?? '';
    document.body.dataset.ending = station.ending ? String(station.ending.number) : '';

    renderStatus(state);
    renderPockets(state);

    const notes = describeEvents(events, { items: engine.items, isAction: kind === 'action' });

    if (kind === 'action') {
      // Text ohne Animation aktualisieren (z. B. verschwindet eine genommene Laterne).
      instantText(el.text, engine.text(state));
      renderNotes(el.notesBottom, notes.filter((n) => n.place === 'bottom'));
      el.choices.hidden = false;
      renderChoices(state);
      return;
    }

    el.title.textContent = station.title;
    el.title.dataset.ending = station.ending ? `Ende ${station.ending.number}` : '';
    renderNotes(el.notesTop, notes.filter((n) => n.place === 'top'));
    renderNotes(el.notesBottom, notes.filter((n) => n.place === 'bottom'));
    el.choices.replaceChildren();
    el.choices.hidden = true;

    if (kind === 'enter') {
      window.scrollTo({ top: 0 });
      el.title.focus({ preventScroll: true });
    }

    const paragraphs = engine.text(state);
    await presentText(el.text, paragraphs, { animate: animate && kind === 'enter', climate: station.climate });
    if (token !== renderToken) return;
    renderChoices(state);
    el.choices.hidden = false;
  }

  /** Nach einer Aktion: Fokus auf die erste Wahl, damit die Tastatur flüssig bleibt. */
  function focusFirstChoice() {
    el.choices.querySelector('button.choice:not([aria-disabled])')?.focus({ preventScroll: true });
  }

  return { render, openInventory, renderInventory: (state) => renderInventory(state), focusFirstChoice, get state() { return currentState; } };
}
