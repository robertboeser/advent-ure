// Hilfsfunktionen für Textausgabe (ohne DOM-Abhängigkeit, damit testbar).

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

/** Wandelt *Betonung* in <em> um; alles andere wird maskiert. */
export function formatInline(text) {
  return escapeHtml(text).replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

/** Entfernt Auszeichnungen (für Screenreader-Kopien und Vorschauen). */
export function plainText(text) {
  return String(text).replace(/\*([^*]+)\*/g, '$1');
}

export function warmthLabel(config, value) {
  for (const [min, label] of config.warmthLabels) if (value >= min) return label;
  return '';
}

/**
 * Übersetzt Engine-Ereignisse in Hinweiszeilen.
 * @returns {{kind: string, text: string, place: 'top'|'bottom'}[]}
 */
export function describeEvents(events, { items, isAction }) {
  const notes = [];
  const place = isAction ? 'bottom' : 'top';
  for (const event of events) {
    switch (event.type) {
      case 'clock':
        notes.push({ kind: 'clock', text: event.text, place });
        break;
      case 'response':
        notes.push({ kind: 'response', text: event.text, place });
        break;
      case 'item': {
        const name = items[event.id]?.name ?? event.id;
        const icon = items[event.id]?.icon ?? '';
        const amount = Math.abs(event.delta);
        const label = amount > 1 ? `${amount} × ${name}` : name;
        notes.push({
          kind: event.delta > 0 ? 'gain' : 'loss',
          text: `${event.delta > 0 ? '+' : '−'} ${icon ? `${icon} ` : ''}${label}`,
          place,
        });
        break;
      }
      case 'attr':
        if (event.id !== 'waerme') break;
        if (event.reason === 'cold') {
          notes.push({
            kind: 'cold',
            text: event.delta <= -2 ? 'Die eisige Kälte kriecht dir tief in die Glieder.' : 'Die Kälte kriecht dir in die Glieder.',
            place,
          });
        } else {
          notes.push({
            kind: event.delta > 0 ? 'warm' : 'cold',
            text: event.delta > 0 ? 'Dir wird wärmer.' : 'Dir wird bitterkalt.',
            place,
          });
        }
        break;
      default:
        break;
    }
  }
  return notes;
}
