// Bereich D – Kirche

export const stations = [
  {
    id: 'kirche_vorplatz',
    title: 'Vor der Kirche',
    area: 'kirche',
    climate: 'kalt',
    text: [
      'Der Kirchhof liegt unter einer dicken Schneedecke. Die Grabsteine tragen weiße Mützen, und zum Portal führen nur die Spuren eines einzigen Menschen.',
      'Der Glockenturm ragt schwarz in den Nachthimmel. An seinen Mauern kriecht Eis empor, fein und kunstvoll wie gewebte Spitze, bis hinauf zur dunklen Laternenkammer. Die schmale Turmtür ist mit einem schweren Vorhängeschloss gesichert.',
      {
        if: { has: 'lichtfunke' },
        text: 'Als du näherkommst, knistert das Eis am Turm, als spüre es den Funken in deiner Laterne. Hoch oben, hinter den Schallöffnungen, glaubst du eine helle Gestalt zu sehen.',
      },
    ],
    choices: [
      { label: 'Die Kirche betreten', to: 'kirchenschiff' },
      {
        label: 'Die Turmtür aufschließen',
        to: 'turmtreppe',
        if: { has: 'turmschluessel' },
        showLocked: true,
        hint: 'Die Tür ist verschlossen. Der Küster hat bestimmt einen Schlüssel.',
      },
      { label: 'Zurück zum Dorfplatz', to: 'dorfplatz', minutes: 5 },
    ],
  },

  {
    id: 'kirchenschiff',
    title: 'Im Kirchenschiff',
    area: 'kirche',
    climate: 'mild',
    text: [
      'Im Kirchenschiff ist es still und dämmrig. Nur ein paar Kerzen brennen vor dem Altar, und es riecht nach Weihrauch und kaltem Stein. Jeder Schritt hallt bis hinauf ins Gewölbe.',
      'Vorn im Altarraum hängt das Ewige Licht in seiner roten Glasschale. Seine Flamme brennt ruhig und unbewegt, als gäbe es keinen Winter.',
      'Seitlich, unter einem bunten Fenster, steht die große Krippe.',
      {
        if: { not: { visited: 'anselm' } },
        text: 'Auf der vordersten Bank sitzt ein alter Mann mit schlohweißem Haar und hält einen Schlüsselbund in den gefalteten Händen.',
      },
      {
        if: { visited: 'anselm' },
        text: 'Küster Anselm sitzt auf der vordersten Bank und murmelt ein Gebet.',
      },
      {
        if: { flag: 'flamme_gestohlen' },
        text: 'Die Flamme in deiner Laterne brennt rot und ruhig. Du wagst nicht, zur vordersten Bank hinüberzusehen.',
      },
    ],
    choices: [
      { label: 'Den Küster ansprechen', to: 'anselm' },
      { label: 'Die Krippe betrachten', to: 'krippe' },
      {
        label: 'Eine Flamme vom Ewigen Licht nehmen',
        if: { has: 'laterne', flag: 'anselm_erlaubnis', hasNot: 'kirchenflamme' },
        effects: { give: { kirchenflamme: 1 }, memory: 'ewiges_licht' },
        response: 'Du hebst die Laterne zum Ewigen Licht. Die Flamme neigt sich hinüber, als hätte sie es eilig, und plötzlich brennen zwei: eine in der Schale, eine in deiner Laterne. Das Ewige Licht ist kein bisschen kleiner geworden.',
      },
      {
        id: 'flamme_ohne_laterne',
        label: 'Eine Flamme vom Ewigen Licht nehmen',
        showIf: { hasNot: ['laterne', 'kirchenflamme'] },
        if: { has: 'laterne' },
        showLocked: true,
        hint: 'Du hast nichts, worin du eine Flamme tragen könntest.',
      },
      {
        label: 'Heimlich eine Flamme stehlen',
        if: { has: 'laterne', notFlag: 'anselm_erlaubnis', hasNot: 'kirchenflamme' },
        effects: { give: { kirchenflamme: 1 }, attr: { guete: -2 }, set: ['flamme_gestohlen'] },
        response: 'Du wartest, bis der Küster den Kopf senkt. Dann schleichst du zum Altar und hältst die Laterne an das Ewige Licht. Die Flamme springt über. Dein Herz klopft so laut, dass du fürchtest, man könnte es im ganzen Kirchenschiff hören.',
      },
      { label: 'Hinaus auf den Vorplatz', to: 'kirche_vorplatz' },
    ],
  },

  {
    id: 'anselm',
    title: 'Küster Anselm',
    area: 'kirche',
    climate: 'mild',
    text: [
      {
        if: { first: true },
        text: 'Der alte Mann blickt auf, als du dich neben ihn setzt. Seine Augen sind rot vom Wachen. „Du bist Ilses Enkelkind, nicht wahr? Ich bin Anselm, der Küster. Ich hab dich bei der Taufe auf dem Arm gehabt.“',
      },
      {
        if: { first: true },
        text: 'Er seufzt. „Was für eine Nacht. Die Laterne dunkel, die große Glocke eingefroren, und Ilse ist nicht gekommen. Sie kommt jedes Jahr um elf mit dem Funken. Jedes Jahr, seit fünfzig Jahren.“',
      },
      {
        if: { first: false },
        text: 'Anselm sieht dich erwartungsvoll an. „Gibt es Neuigkeiten, Kind?“',
      },
      {
        if: { has: 'lichtfunke', hasNot: 'turmschluessel' },
        text: 'Sein Blick fällt auf deine Laterne, und er wird ganz still.',
      },
    ],
    choices: [
      {
        label: 'Fragen, was ihn bedrückt',
        effects: { set: ['anselm_sorge'] },
        response: '„Ach, alles Mögliche.“ Er dreht den Schlüsselbund in den Händen. „Und dann das noch: Aus der Krippe ist das Silberglöckchen verschwunden, das das Christkind in der Hand hält. Seit zweihundert Jahren hängt es da. Und jetzt ist es fort.“ Er senkt die Stimme. „Ich hab winzige Fußspuren im Stroh gefunden. Wichtel, wenn du mich fragst. Diebisches kleines Volk.“',
      },
      {
        label: 'Ihm Omas Brief zeigen',
        if: { has: 'omas_brief' },
        effects: { set: ['anselm_erlaubnis'] },
        response: 'Anselm liest den Brief zweimal. Seine Hände zittern ein wenig. „Feuer, das nie erlischt“, murmelt er. „Natürlich. Das Ewige Licht.“ Er sieht dich an. „Nimm dir eine Flamme davon, Kind. Dafür brennt es ja: für Nächte wie diese. Licht wird nicht weniger, wenn man es teilt.“',
      },
      {
        label: 'Ihm den Lichtfunken zeigen',
        if: { has: 'lichtfunke', hasNot: 'turmschluessel' },
        effects: { give: { turmschluessel: 1 } },
        response: 'Anselm starrt in deine Laterne. Das Licht des Funkens spiegelt sich in seinen Augen, und für einen Augenblick sieht er aus wie ein Junge. „Der Funke“, flüstert er. „Du hast ihn befreit.“ „Oma ist da oben“, sagst du. „Der Schneeweber hat sie.“ Anselm wird bleich. Mit zitternden Fingern löst er einen schweren eisernen Schlüssel vom Bund. „Der Turm. Geh, Kind, geh! Ich bete für euch.“',
      },
      {
        label: 'Ihm das Silberglöckchen zurückgeben',
        if: { has: 'silberglocke', flag: 'rune_klang' },
        effects: { take: { silberglocke: 1 }, attr: { guete: 2 }, set: ['gloeckchen_zurueck'] },
        response: 'Anselm nimmt das Glöckchen behutsam in beide Hände und hält es ans Ohr, als könnte es ihm etwas erzählen. „Wo hast du …? Nein, sag nichts.“ Er lächelt zum ersten Mal in dieser Nacht. „Danke, Kind. Das Christkind wird sich freuen.“',
      },
      {
        id: 'gloeckchen_spaeter',
        label: 'Ihm das Silberglöckchen zurückgeben',
        showIf: { has: 'silberglocke', notFlag: 'rune_klang' },
        if: { flag: 'rune_klang' },
        showLocked: true,
        hint: 'Vielleicht brauchst du es selbst noch – für die Glockenrune.',
      },
      { label: 'Zurück ins Kirchenschiff', to: 'kirchenschiff' },
    ],
  },

  {
    id: 'krippe',
    title: 'Die Krippe',
    area: 'kirche',
    climate: 'mild',
    text: [
      'Die Krippe ist fast so groß wie ein Tisch. Ochs und Esel, Hirten mit Lämmern auf den Schultern, drei Könige mit Kronen aus Blattgold. Jemand hat jede Figur mit unendlicher Geduld aus Lindenholz geschnitzt.',
      {
        if: { notFlag: 'gloeckchen_zurueck' },
        text: 'In der Mitte liegt das Christkind im Stroh und streckt eine Hand aus, als wollte es dir etwas zeigen. Die Hand ist leer. Am Handgelenk hängt noch ein zerrissenes rotes Bändchen.',
      },
      {
        if: { flag: 'gloeckchen_zurueck' },
        text: 'In der Mitte liegt das Christkind im Stroh. In seiner ausgestreckten Hand hängt wieder das Silberglöckchen und schimmert im Kerzenlicht.',
      },
      {
        if: { flag: 'anselm_sorge', notFlag: 'gloeckchen_zurueck' },
        text: 'Das muss das Silberglöckchen gewesen sein, von dem Anselm erzählt hat.',
      },
      'Im Stroh entdeckst du winzige Fußspuren, nicht größer als ein Fingernagel. An einer Stelle fehlt ein Büschel Stroh, säuberlich herausgezupft. Die Spuren führen zu einem Mauseloch hinter der Krippe.',
    ],
    choices: [{ label: 'Zurück ins Kirchenschiff', to: 'kirchenschiff' }],
  },
];
