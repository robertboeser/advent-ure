// Zeichenweise Textausgabe, jederzeit überspringbar.
//
// Der noch nicht geschriebene Text steht bereits unsichtbar im Dokument
// (visibility: hidden), damit das Layout beim Schreiben nicht springt.
// Screenreader bekommen sofort den vollständigen Text über eine
// unsichtbare Kopie; die animierte Fassung ist so lange aria-hidden.

import { formatInline, plainText } from './format.js';

/** Zeichen pro Sekunde je Einstellung (0 = sofort). */
export const SPEEDS = { langsam: 38, normal: 70, schnell: 150, sofort: 0 };

/** Pause zwischen Absätzen, in Sekunden. */
const PARAGRAPH_PAUSE = 0.35;

/**
 * @param {{getSpeed: () => string, reducedMotion: () => boolean, srTarget: HTMLElement}} options
 */
export function createTypewriter({ getSpeed, reducedMotion, srTarget }) {
  let finish = null;

  function present(container, paragraphs, { animate = true } = {}) {
    finish?.();
    container.innerHTML = paragraphs.map((p) => `<p>${formatInline(p)}</p>`).join('');
    const cps = SPEEDS[getSpeed()] ?? SPEEDS.normal;
    if (!animate || !cps || reducedMotion()) return Promise.resolve();

    // Jeden Textknoten in „gezeigt“ + „versteckt“ aufteilen.
    const parts = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    for (const node of textNodes) {
      const shown = document.createElement('span');
      const hidden = document.createElement('span');
      hidden.className = 'tw-hidden';
      hidden.textContent = node.data;
      node.replaceWith(shown, hidden);
      parts.push({ shown, hidden, text: hidden.textContent, paragraph: shown.closest('p') });
    }

    srTarget.textContent = paragraphs.map(plainText).join('\n\n');
    container.setAttribute('aria-hidden', 'true');
    container.classList.add('is-typing');

    return new Promise((resolve) => {
      let index = 0;
      let pos = 0;
      let budget = 0;
      let last = performance.now();
      let raf = 0;

      finish = () => {
        cancelAnimationFrame(raf);
        for (const part of parts) {
          part.shown.textContent = part.text;
          part.hidden.textContent = '';
        }
        container.removeAttribute('aria-hidden');
        container.classList.remove('is-typing');
        srTarget.textContent = '';
        finish = null;
        resolve();
      };

      const frame = (now) => {
        budget += ((now - last) / 1000) * cps;
        last = now;
        let chars = Math.floor(budget);
        budget -= chars;
        while (chars > 0 && index < parts.length) {
          const part = parts[index];
          const take = Math.min(chars, part.text.length - pos);
          pos += take;
          chars -= take;
          part.shown.textContent = part.text.slice(0, pos);
          part.hidden.textContent = part.text.slice(pos);
          if (pos >= part.text.length) {
            const next = parts[index + 1];
            if (next && next.paragraph !== part.paragraph) {
              budget -= PARAGRAPH_PAUSE * cps;
              chars = 0;
            }
            index++;
            pos = 0;
          }
        }
        if (index >= parts.length) finish();
        else raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    });
  }

  /** @returns {boolean} true, wenn eine laufende Animation beendet wurde */
  function skip() {
    if (!finish) return false;
    finish();
    return true;
  }

  return {
    present,
    skip,
    get active() {
      return finish !== null;
    },
  };
}
