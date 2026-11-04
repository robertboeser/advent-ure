// Gegenstände („Manteltaschen“).

export const items = {
  laterne: {
    name: 'Laterne',
    icon: '🏮',
    description: 'Eine verbeulte Laterne mit Glasschirm. Darin kannst du eine Flamme durch Wind und Schnee tragen.',
  },
  streichhoelzer: {
    name: 'Streichhölzer',
    icon: '📦',
    description: 'Eine Schachtel Schwedenhölzer aus Omas Küche. Gut zum Feuermachen.',
  },
  lebkuchen: {
    name: 'Lebkuchen',
    icon: '🍪',
    description: 'Omas Lebkuchen, dick mit Schokolade überzogen, auf jedem ein Mandelstern. Man kann ihn essen oder verschenken.',
    use: {
      label: 'Essen',
      effects: { take: { lebkuchen: 1 }, attr: { waerme: 1 } },
      response: 'Du isst einen Lebkuchen. Er schmeckt nach Omas Küche, nach Nelken und Honig, und für einen Moment ist dir warm ums Herz.',
    },
  },
  zimtsterne: {
    name: 'Zimtsterne',
    icon: '⭐',
    description: 'Ein Päckchen Zimtsterne, in Butterbrotpapier eingeschlagen. Sie duften so stark, dass man sie durch den Mantel riecht.',
  },
  omas_brief: {
    name: 'Omas Brief',
    icon: '✉️',
    description: '„Frost weicht nur dreierlei: dem Feuer, das nie erlischt, dem Klang, der Herzen ruft, und der Gabe, die ohne Grund gegeben wird.“',
  },
  schal: {
    name: 'Großvaters Wollschal',
    icon: '🧣',
    description: 'Dunkelgrün, kratzig, mit eingestrickten Hirschen. Er hält die Kälte ab.',
  },
  spieldose_kaputt: {
    name: 'Stumme Spieldose',
    icon: '🔇',
    description: 'Eine kleine Spieldose aus Nussholz mit eingelegtem Stern. Innen fehlt ein Zahnrad; die Kurbel klickt nur.',
  },
  spieldose: {
    name: 'Omas Spieldose',
    icon: '🎶',
    description: 'Wieder ganz. Wenn du die Kurbel drehst, spielt sie Omas Wiegenlied.',
  },
  silberglocke: {
    name: 'Silberglöckchen',
    icon: '🔔',
    description: 'Das Glöckchen aus der Hand des Christkinds in der Krippe. Es klingt so hell, dass man es im Herzen hört.',
  },
  maronen: {
    name: 'Heiße Maronen',
    icon: '🌰',
    description: 'Eine Tüte geröstete Maronen von Agathe. Sie wärmen schon durch das Papier.',
    use: {
      label: 'Essen',
      effects: { take: { maronen: 1 }, attr: { waerme: 2 } },
      response: 'Du pellst die heißen Maronen und isst sie eine nach der anderen. Die Wärme breitet sich von innen aus.',
    },
  },
  strohstern: {
    name: 'Strohstern',
    icon: '🌾',
    description: 'Ein kleiner Stern aus geflochtenem Stroh. Er ist leicht und warm, als hätte ihn jemand lange in der Hand gehalten.',
  },
  kirchenflamme: {
    name: 'Flamme des Ewigen Lichts',
    icon: '🕯️',
    description: 'Eine ruhige rote Flamme in deiner Laterne, entzündet am Ewigen Licht der Kirche. Sie flackert nicht, egal wie der Wind weht.',
  },
  glut: {
    name: 'Köhlerglut',
    icon: '🔥',
    description: 'Ein Stück Glut aus Ruprechts Meiler, der seit vierzig Jahren brennt. Es glimmt in deiner Laterne und will nicht erlöschen.',
  },
  turmschluessel: {
    name: 'Turmschlüssel',
    icon: '🗝️',
    description: 'Ein schwerer, eiserner Schlüssel. Er öffnet die Tür zum Glockenturm.',
  },
  lichtfunke: {
    name: 'Der Lichtfunke',
    icon: '✨',
    description: 'Ein Funke vom Weihnachtsstern, kleiner als eine Haselnuss. Er summt leise und wärmt dich wie ein zweiter Mantel.',
  },
};
