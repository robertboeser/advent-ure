// Bereich F – Der Wald

export const stations = [
  {
    id: 'waldrand',
    title: 'Am Waldrand',
    area: 'wald',
    climate: 'kalt',
    text: [
      'Am Waldrand endet das Dorf und mit ihm das Licht. Die Tannen stehen dicht an dicht, schwarz und schweigend, die Äste schwer vom Schnee. Irgendwo rutscht eine Last herunter, mit einem leisen *Wumpf*, und dann ist es wieder still.',
      'Von links weht Rauchgeruch heran, aus der Tiefe des Waldes. Geradeaus glitzert etwas zwischen den Stämmen, kalt und silbern: der Eissee.',
      {
        if: { notFlag: 'fuchs_freund' },
        text: 'Und von rechts, von einer kleinen Lichtung, kommt ein Geräusch, das dir durch und durch geht: ein dünnes, verzweifeltes Wimmern.',
      },
      {
        if: { flag: 'fuchs_freund' },
        text: 'Am Wegrand sitzt der Fuchs im Schnee, als hätte er auf dich gewartet. Seine Augen glimmen im Dunkeln.',
      },
      { if: { hasNot: 'laterne' }, text: 'Ohne Licht wirkt der Wald wie eine schwarze Wand.' },
    ],
    choices: [
      { label: 'Mit der Laterne dem Rauchgeruch folgen', to: 'koehlerhuette', minutes: 10, if: { has: 'laterne' } },
      {
        label: 'Dem Fuchs folgen, der vorausläuft',
        to: 'koehlerhuette',
        minutes: 10,
        if: { flag: 'fuchs_freund', hasNot: 'laterne' },
      },
      {
        label: 'Im Dunkeln dem Rauchgeruch folgen',
        to: 'wald_dunkel',
        minutes: 10,
        if: { hasNot: 'laterne', notFlag: 'fuchs_freund' },
      },
      { label: 'Dem Wimmern nachgehen', to: 'lichtung_fuchs', minutes: 5, if: { notFlag: 'fuchs_freund' } },
      { label: 'Zum glitzernden Eissee', to: 'eissee_ufer', minutes: 10 },
      { label: 'Zurück zum Dorfplatz', to: 'dorfplatz', minutes: 15 },
      { label: 'Zum Weg Richtung Bahnhof', to: 'dorfweg', minutes: 15 },
    ],
  },

  {
    id: 'wald_dunkel',
    title: 'Im dunklen Wald',
    area: 'wald',
    climate: 'eisig',
    text: [
      'Nach wenigen Schritten verschluckt dich die Dunkelheit. Du tastest dich von Stamm zu Stamm. Zweige schlagen dir ins Gesicht, Schnee rieselt dir in den Kragen, und bei jedem Schritt versinkst du bis zu den Knien.',
      'Längst hast du die Richtung verloren. Nur irgendwo zwischen den Bäumen, weit weg, glimmt etwas Rotes, wie ein Auge, das sich langsam öffnet und schließt.',
    ],
    choices: [
      { label: 'Auf das rote Glimmen zustapfen', to: 'koehlerhuette', minutes: 15 },
      { label: 'Umkehren', to: 'waldrand', minutes: 10 },
    ],
  },

  {
    id: 'lichtung_fuchs',
    title: 'Die Lichtung',
    area: 'wald',
    climate: 'kalt',
    text: [
      {
        if: { notFlag: 'fuchs_freund' },
        text: 'Auf einer kleinen Lichtung kauert ein Fuchs im Schnee. Sein rotes Fell leuchtet im Mondlicht wie Glut. Eine Hinterpfote steckt in einer alten Drahtschlinge, die sich tief ins Fell gegraben hat. Als er dich sieht, fletscht er die Zähne, aber er ist zu erschöpft, um zu knurren.',
      },
      'Rings um die Lichtung ist der Schnee zu feinen Mustern gefroren, Sterne und Ranken, wie gestickt. Der Schneeweber muss hier vorbeigekommen sein.',
      {
        if: { notFlag: 'fuchs_freund' },
        text: 'Er hat den Fuchs gesehen und ist weitergegangen.',
      },
      {
        if: { flag: 'fuchs_freund' },
        text: 'Die Schlinge liegt zerrissen im Schnee. Der Fuchs leckt sich die Pfote und sieht immer wieder zu dir herüber.',
      },
    ],
    choices: [
      {
        label: 'Die Schlinge vorsichtig lösen',
        minutes: 5,
        effects: { attr: { guete: 1 }, set: ['fuchs_freund'], memory: 'fuchs' },
        response: 'Du kniest dich in den Schnee und redest leise auf ihn ein, ohne zu wissen, was du sagst. Der Fuchs zittert, aber er hält still. Der Draht ist steif gefroren und schneidet dir in die Finger, bis er endlich nachgibt. Der Fuchs zieht die Pfote heraus, humpelt drei Schritte – und bleibt stehen. Er sieht dich lange an. Dann setzt er sich hin und wartet.',
      },
      {
        label: 'Ihm einen Lebkuchen hinlegen',
        if: { has: 'lebkuchen' },
        effects: { take: { lebkuchen: 1 }, attr: { guete: 1 } },
        response: 'Du legst einen Lebkuchen vor ihn in den Schnee. Der Fuchs schnuppert misstrauisch, dann frisst er ihn mit drei Bissen. Schokolade klebt ihm an der Schnauze.',
      },
      {
        label: 'Zurück zum Waldrand',
        to: 'waldrand',
        minutes: 5,
      },
    ],
  },

  {
    id: 'koehlerhuette',
    title: 'Ruprechts Köhlerhütte',
    area: 'wald',
    climate: 'warm',
    text: [
      {
        if: { first: true },
        text: 'Zwischen den Bäumen öffnet sich eine Lichtung. In ihrer Mitte raucht ein mächtiger Kohlenmeiler, ein Hügel aus Erde und Holz, aus dessen Ritzen rotes Licht glimmt. Daneben duckt sich eine Hütte aus rohen Stämmen. Vor der Tür prasselt ein Feuer, und davor sitzt ein Mann, so groß und breit, dass du zuerst an einen Bären denkst.',
      },
      {
        if: { first: true },
        text: '„Ruprecht“, brummt er, ohne aufzustehen. „Köhler. Was willst du hier, mitten in der Nacht?“ Er mustert dich unter buschigen Brauen. Dann rückt er ein Stück zur Seite, und es ist Platz am Feuer.',
      },
      {
        if: { first: false },
        text: 'Ruprecht sitzt am Feuer und stochert in der Glut. Er nickt dir zu, als wärst du nie weg gewesen.',
      },
      'Der Meiler brennt seit vierzig Jahren, sagt man im Dorf. Ruprecht hat ihn kein einziges Mal ausgehen lassen.',
      { if: { flag: 'holz_gehackt' }, text: 'Neben der Hütte stapelt sich frisch gehacktes Holz.' },
      { if: { flag: 'fuchs_freund', hasNot: 'laterne' }, text: 'Der Fuchs hat sich am Rand der Lichtung zusammengerollt und wartet.' },
    ],
    choices: [
      {
        label: 'Dich am Feuer aufwärmen',
        minutes: 5,
        effects: { attr: { waerme: 3 } },
        response: 'Du hältst die Hände über die Flammen, bis sie kribbeln. Ruprecht schiebt dir wortlos einen Becher mit etwas Heißem hin, das nach Holunder schmeckt.',
      },
      {
        label: 'Nach dem Schneeweber fragen',
        minutes: 5,
        effects: { set: ['legende_ruprecht'] },
        response: 'Ruprecht schweigt lange. Das Feuer knackt. „Ich hab ihn gesehen“, sagt er schließlich. „Da war ich so alt wie du. Hab mich im Schneesturm verlaufen und dachte, das war’s. Und dann stand er vor mir. Groß wie eine Tanne und durchsichtig wie Eis.“ Er stochert in der Glut. „Er hat mich angesehen, und weißt du, was ich in seinem Gesicht gesehen hab? Keine Bosheit. Nur, wie gern er sich mal an ein Feuer gesetzt hätte. Dann hat er mir den Weg gezeigt. Keiner im Dorf hat mir das je geglaubt.“',
      },
      {
        label: 'Um Glut aus dem Meiler bitten',
        if: {
          has: 'laterne',
          hasNot: 'glut',
          any: [{ attr: { guete: { gte: 2 } } }, { flag: 'holz_gehackt' }],
        },
        effects: { give: { glut: 1 }, memory: 'glut' },
        response: 'Ruprecht sieht dich lange an. Dann steht er auf, nimmt eine eiserne Zange und holt ein Stück Glut aus dem Meiler, rot wie ein Rubin. Vorsichtig legt er es in deine Laterne. „Vierzig Jahre“, sagt er. „Die geht nicht aus. Pass auf, wem du sie gibst.“',
      },
      {
        id: 'glut_abgelehnt',
        label: 'Um Glut aus dem Meiler bitten',
        if: { has: 'laterne', hasNot: 'glut', attr: { guete: { lt: 2 } }, notFlag: 'holz_gehackt' },
        response: '„Glut?“ Ruprecht schnaubt. „Glut ist kein Geschenk für Fremde. Die hat mich vierzig Jahre Arbeit gekostet.“ Er deutet mit dem Kinn auf einen Haufen ungespaltener Stämme. „Aber beim Holzhacken – da könnt’ ich Hilfe brauchen.“',
      },
      {
        id: 'glut_ohne_laterne',
        label: 'Um Glut aus dem Meiler bitten',
        showIf: { hasNot: ['laterne', 'glut'] },
        if: { has: 'laterne' },
        showLocked: true,
        hint: 'Du hast nichts, worin du Glut tragen könntest.',
      },
      { label: 'Ihm beim Holzhacken helfen', to: 'holzhacken', if: { notFlag: 'holz_gehackt' } },
      { label: 'Zurück zum Waldrand', to: 'waldrand', minutes: 10 },
    ],
  },

  {
    id: 'holzhacken',
    title: 'Holz für den Winter',
    area: 'wald',
    climate: 'kalt',
    text: [
      'Ruprecht drückt dir eine Axt in die Hand, die fast so schwer ist wie du. „Nicht mit den Armen“, brummt er. „Mit dem ganzen Körper. Und schau dahin, wo du hinwillst, nicht auf die Axt.“',
      'Die ersten Schläge gehen daneben. Dann trifft die Klinge, und das Holz springt mit einem hellen Krachen auseinander. Bald findest du einen Rhythmus: heben, schlagen, auseinanderziehen, nachlegen. Dir wird warm, trotz der Kälte, und der Stapel wächst.',
      'Ruprecht sieht dir eine Weile zu. Dann nickt er. Nur einmal, aber es fühlt sich an wie eine Medaille.',
    ],
    choices: [
      {
        label: 'Die Axt zurückgeben',
        to: 'koehlerhuette',
        minutes: 20,
        effects: { set: ['holz_gehackt'], attr: { guete: 1, waerme: 1 }, memory: 'holz' },
      },
    ],
  },

  {
    id: 'eissee_ufer',
    title: 'Am Eissee',
    area: 'wald',
    climate: 'eisig',
    text: [
      'Der Wald öffnet sich, und vor dir liegt der Eissee: ein schwarzer, glatter Spiegel, so groß, dass sich der ganze Sternenhimmel darin verliert. Kein Windhauch. Kein Laut. Nur dein eigener Atem.',
      {
        if: { notFlag: 'schneeweber_getroffen' },
        text: 'Weit draußen in der Mitte des Sees steht etwas, das nicht hierher gehört: ein Webstuhl, so hoch wie ein Haus, gebaut aus Eis und Mondlicht. Zwischen seinen Balken spannen sich glitzernde Fäden, und von dort schweben Schneeflocken auf, eine nach der anderen, und steigen in den Himmel.',
      },
      {
        if: { flag: 'schneeweber_getroffen' },
        text: 'Draußen in der Mitte des Sees steht der Webstuhl, verlassen. Keine Flocken steigen mehr auf.',
      },
      {
        if: { notFlag: 'korb_gefunden' },
        text: 'Am Ufer, halb im Schnee versunken, liegt ein Weidenkorb. Du kennst ihn. Es ist Omas Korb.',
      },
      {
        if: { flag: 'korb_gefunden' },
        text: 'Omas Korb liegt im Schnee, wo du ihn gefunden hast. Der rote Wollfaden führt hinaus aufs Eis.',
      },
      {
        if: { flag: 'fuchs_freund' },
        text: 'Der Fuchs bleibt am Waldrand stehen und will keinen Schritt weiter.',
      },
    ],
    choices: [
      {
        label: 'Omas Korb untersuchen',
        effects: { set: ['korb_gefunden'] },
        response: 'Der Korb ist leer bis auf ein Wollknäuel, rot wie Omas Mütze. Das Ende des Fadens ist hinaus aufs Eis gezogen, schnurgerade bis zum Webstuhl. Oma muss es ausgelegt haben, damit du den Weg findest. Oder damit sie selbst zurückfindet.',
      },
      {
        label: 'Über das Eis zum Webstuhl gehen',
        to: 'webstuhl',
        minutes: 5,
        effects: { attr: { waerme: -1 } },
      },
      { label: 'Zurück zum Waldrand', to: 'waldrand', minutes: 10 },
    ],
  },

  {
    id: 'webstuhl',
    title: 'Der Webstuhl',
    area: 'wald',
    climate: 'eisig',
    onEnter: { memory: 'webstuhl' },
    text: [
      {
        if: { notFlag: 'schneeweber_getroffen' },
        text: 'Je näher du kommst, desto größer wird der Webstuhl. Seine Balken sind aus klarem Eis, und in ihnen schweben Luftblasen wie eingefrorene Sterne. Die Fäden sind aus Mondlicht. Wo sie sich kreuzen, entsteht eine Schneeflocke, löst sich und schwebt davon.',
      },
      {
        if: { notFlag: 'schneeweber_getroffen' },
        text: 'Vor dem Webstuhl sitzt eine Gestalt, so hoch wie zwei Männer und so durchscheinend wie Eis; durch ihren Körper hindurch siehst du die Sterne. Lange, dünne Finger führen das Schiffchen hin und her, hin und her, unaufhörlich. Der Schneeweber.',
      },
      {
        if: { notFlag: 'schneeweber_getroffen' },
        text: 'Im Gewebe erkennst du ein Bild: eine kleine Frau mit roter Mütze, die Augen geschlossen, die Hände gefaltet. *Oma.*',
      },
      {
        if: { notFlag: 'schneeweber_getroffen' },
        text: 'Der Schneeweber hält inne. Er wendet dir das Gesicht zu, und seine Stimme klingt wie Wind, der durch Tannen streicht: „Ein Kind der Lichthüterin. Bist du gekommen, um mir den Funken zu bringen?“',
      },
      {
        if: { flag: 'schneeweber_getroffen' },
        text: 'Der Webstuhl ist verlassen. Die Fäden hängen lose und klirren leise im Wind. Das Bild mit Oma ist fort, und auch der Schneeweber. Nur eine Spur aus Eiskristallen führt zurück zum Ufer, in Richtung Dorf. In Richtung Kirchturm.',
      },
    ],
    choices: [
      {
        label: 'Ihn fragen, warum er das tut',
        to: 'schneeweber_gespraech',
        if: { notFlag: 'schneeweber_getroffen' },
        effects: { set: ['schneeweber_getroffen'] },
      },
      {
        label: 'Anbieten, Omas Platz einzunehmen',
        to: 'ende_schneeweber',
        if: { notFlag: 'schneeweber_getroffen', flag: 'korb_gefunden' },
      },
      {
        label: 'Die Flamme gegen ihn erheben',
        to: 'eissee_ufer',
        if: { ref: 'hat_flamme', notFlag: 'schneeweber_getroffen' },
        effects: { set: ['schneeweber_getroffen', 'schneeweber_gereizt'] },
        response: 'Du reißt die Laterne hoch. Die Flamme lodert auf, und der Schneeweber weicht zurück, zischend wie Wasser auf heißem Stein. Für einen Augenblick siehst du in seinem Gesicht etwas, das wie Schmerz aussieht. Dann erhebt sich ein Sturm aus Schnee, so dicht, dass du die Hand nicht mehr vor Augen siehst. Als er sich legt, stehst du am Ufer. „Um Mitternacht“, flüstert der Wind. „Am Turm.“',
      },
      {
        label: 'Fliehen',
        to: 'eissee_ufer',
        minutes: 5,
        if: { notFlag: 'schneeweber_getroffen' },
        effects: { set: ['schneeweber_getroffen'], attr: { waerme: -1 } },
        response: 'Du drehst dich um und rennst, schlitterst, fällst, rappelst dich auf. Hinter dir ist kein Laut zu hören, nur ein leises Seufzen, wie Wind. Als du dich am Ufer umdrehst, ist der Webstuhl leer.',
      },
      {
        label: 'Zurück ans Ufer',
        to: 'eissee_ufer',
        minutes: 5,
        if: { flag: 'schneeweber_getroffen' },
      },
    ],
  },

  {
    id: 'schneeweber_gespraech',
    title: 'Tausend Winter',
    area: 'wald',
    climate: 'eisig',
    text: [
      '„Warum?“, fragst du. „Warum hast du Oma mitgenommen?“',
      'Der Schneeweber schweigt so lange, dass du glaubst, er habe dich nicht gehört. Dann spricht er, und seine Stimme ist leise wie fallender Schnee.',
      '„Tausend Winter sitze ich an diesem Webstuhl. Jede Flocke, die auf eure Dächer fällt, habe ich gewebt. Keine gleicht der anderen. In jede habe ich ein Muster gelegt, das es nie wieder geben wird.“ Er hebt eine Flocke auf seine Fingerspitze und betrachtet sie. „Ihr fegt sie von euren Schwellen. Ihr flucht über sie. Nicht ein einziges Mal hat jemand Danke gesagt.“',
      '„Jedes Jahr in dieser Nacht seht ihr hinauf zu eurem Licht und seid froh. Ich habe nie gefühlt, wie das ist: warm zu sein. Nur ein einziges Mal möchte ich es wissen. Die Lichthüterin wollte mir den Funken nicht geben. Also habe ich sie mitgenommen.“',
      'Er wendet sich wieder dem Webstuhl zu. „Wir sehen uns um Mitternacht, Kind der Lichthüterin. Am Turm. Bring mir den Funken.“',
    ],
    choices: [
      {
        label: 'Schweigend nicken',
        to: 'webstuhl',
        effects: { set: ['schneeweber_verstanden'], attr: { guete: 1 } },
        response: 'Als du wieder aufsiehst, ist er fort, und mit ihm das Bild von Oma.',
      },
    ],
  },
];
