// Bereich A – Ankunft

export const stations = [
  {
    id: 'bahnhof',
    title: 'Der Bahnhof',
    area: 'ankunft',
    climate: 'kalt',
    text: [
      {
        if: { first: true },
        text: 'Mit einem langen Seufzer aus Dampf kommt der Zug zum Stehen. Du trittst auf den Bahnsteig, und die Kälte beißt dir in die Wangen. Schnee fällt in dicken, lautlosen Flocken und dämpft jedes Geräusch, bis du nur noch deinen eigenen Atem hörst.',
      },
      {
        if: { first: true },
        text: 'Niemand ist da. Oma steht sonst immer unter der alten Bahnhofsuhr, mit roter Mütze und einer Thermoskanne Kakao. Heute hängt die Uhr allein im Schneetreiben. Es ist neun.',
      },
      {
        if: { first: false },
        text: 'Der kleine Bahnhof liegt verlassen unter dem Schnee. Die Gleise sind zugeweht, der letzte Zug ist längst fort. Unter der Bahnhofsuhr steht niemand.',
      },
      'Im Wärterhäuschen am Ende des Bahnsteigs flackert gelbes Licht. Unten im Tal liegt Tannbrück, ein paar erleuchtete Fenster unter dem Schnee. Nur der Kirchturm, der in dieser Nacht immer leuchtet, ist dunkel.',
    ],
    choices: [
      {
        label: 'An die Tür des Wärterhäuschens klopfen',
        to: 'waerterhaus',
        effects: { set: ['zug_abgefahren'] },
      },
      {
        label: 'Dem Pfad ins Dorf folgen',
        to: 'dorfweg',
        minutes: 10,
        effects: { set: ['zug_abgefahren'] },
        response: 'Hinter dir schnauft der Zug davon. Seine roten Schlusslichter verschwinden im Schneetreiben.',
      },
      {
        label: 'Zurück in den warmen Zug steigen',
        to: 'ende_heimweg',
        if: { notFlag: 'zug_abgefahren' },
      },
    ],
  },

  {
    id: 'waerterhaus',
    title: 'Gustavs Wärterhäuschen',
    area: 'ankunft',
    climate: 'warm',
    text: [
      {
        if: { first: true },
        text: 'Kaum hast du geklopft, fliegt die Tür auf. Warme Luft schlägt dir entgegen, Kohlenrauch und Kräuterduft. „Na, wen haben wir denn da?“ Gustav, der Bahnhofswärter, mustert dich unter buschigen Brauen. Dann hellt sich sein Gesicht auf. „Ilses Enkelkind! Komm rein, komm rein, eh du festfrierst.“',
      },
      {
        if: { first: true },
        text: '„Deine Oma?“ Er kratzt sich am Bart. „Die ist heut Nachmittag hier vorbei, Richtung Wald. Mit leerem Korb, bei dem Wetter! Hat nur gesagt, sie hätt’ noch was zu erledigen, bevor die Laterne angeht.“ Er wirft einen Blick hinunter zum dunklen Kirchturm und brummt etwas in seinen Bart.',
      },
      {
        if: { first: false },
        text: 'Gustav sieht von seiner Zeitung auf, als du wieder hereinkommst. „Noch immer unterwegs? Der Turm ist immer noch dunkel“, brummt er. „Pass bloß auf dich auf.“',
      },
      'Im Häuschen ist kaum Platz für den bullernden Kanonenofen, einen Stuhl und Gustav selbst. Auf dem Ofen summt ein Wasserkessel.',
      { if: { notFlag: 'laterne_von_gustav' }, text: 'An einem Haken neben der Tür hängt eine verbeulte Sturmlaterne.' },
    ],
    choices: [
      {
        label: 'Einen Becher Tee annehmen',
        minutes: 5,
        effects: { attr: { waerme: 2 }, set: ['tee_getrunken'], memory: 'tee' },
        response: 'Der Tee ist so heiß, dass du ihn in kleinen Schlucken trinken musst. Er schmeckt nach Thymian und Honig, und die Wärme kriecht dir bis in die Zehenspitzen.',
      },
      {
        label: 'Um die Sturmlaterne bitten',
        if: { hasNot: 'laterne' },
        effects: { give: { laterne: 1 }, set: ['laterne_von_gustav'], memory: 'laterne' },
        response: '„Die da?“ Gustav nimmt die Laterne vom Haken, putzt mit dem Ärmel über das Glas und drückt sie dir in die Hand. „Die hat mich durch vierzig Winter gebracht. Pass gut auf sie auf. Und bring sie mir zurück, hörst du?“',
      },
      { label: 'Hinaus und hinunter ins Dorf', to: 'dorfweg', minutes: 10 },
    ],
  },

  {
    id: 'dorfweg',
    title: 'Der Weg hinab',
    area: 'ankunft',
    climate: 'kalt',
    text: [
      'Der Weg windet sich zwischen tief verschneiten Tannen ins Tal hinab. Unter deinen Stiefeln knirscht der Schnee, und deine Atemwolken hängen in der Luft, als wollten sie nicht weiterziehen.',
      {
        if: { first: true },
        text: 'Unten liegt Tannbrück: spitze Dächer, Rauch aus den Schornsteinen, ein paar gelbe Fenster. Über allem ragt der Kirchturm auf, und seine Spitze ist dunkel. In jeder Heiligen Nacht, solange du denken kannst, hat dort oben die Sternlaterne geleuchtet.',
      },
      {
        if: { first: true },
        text: 'Am Wegrand bemerkst du zwei Spuren im Schnee. Die eine stammt von kleinen Stiefeln mit Absatz, wie Oma sie trägt. Die andere sieht aus, als hätte jemand Eiskristalle in den Schnee gedrückt, groß wie Hände. Beide führen hinüber zum Wald.',
      },
      {
        if: { first: false },
        text: 'Die beiden Spuren am Wegrand, Omas Stiefel und die seltsamen Eiskristalle, sind fast zugeschneit. Sie führen noch immer zum Wald.',
      },
    ],
    choices: [
      { label: 'Zu Omas Haus am Dorfrand', to: 'omas_haus', minutes: 10 },
      { label: 'Hinunter zum Dorfplatz', to: 'dorfplatz', minutes: 10 },
      { label: 'Den Spuren in den Wald folgen', to: 'waldrand', minutes: 15 },
      { label: 'Zurück zum Bahnhof', to: 'bahnhof', minutes: 10 },
    ],
  },
];
