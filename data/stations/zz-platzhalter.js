// Vorläufige Platzhalter für Bereiche, die in M4 geschrieben werden.

const stub = (id, title, climate = 'kalt') => ({
  id,
  title,
  area: 'dorf',
  climate,
  text: ['Dieser Teil der Geschichte wird noch geschrieben. Der Schnee fällt einstweilen weiter.'],
  choices: [{ label: 'Zurück zu Omas Haus', to: 'omas_haus', minutes: 5 }],
});

const stubEnding = (id, number, title) => ({
  id,
  title,
  area: 'ende',
  climate: 'kalt',
  ending: { number, title, memory: id },
  text: ['Hier endet die Geschichte – vorerst.'],
  choices: [],
});

export const stations = [
  stub('dorfplatz', 'Der Dorfplatz'),
  stub('waldrand', 'Am Waldrand'),
  stub('kirche_vorplatz', 'Vor der Kirche'),
  stubEnding('ende_heimweg', 6, 'Heimweg'),
  stubEnding('ende_schneeschlaf', 5, 'Schneeschlaf'),
  stubEnding('ende_zu_spaet', 4, 'Zu spät'),
];
