// Die sieben Enden

/** Epilog-Absätze für die guten Enden, abhängig davon, wem du unterwegs geholfen hast. */
const EPILOG = [
  {
    if: { flag: 'fuchs_freund' },
    text: 'Unten vor der Kirche sitzt ein roter Fuchs im Schnee und schaut zum Licht hinauf. Als du ihm zuwinkst, zuckt er mit einem Ohr.',
  },
  {
    if: { flag: 'pimpernell_freund' },
    text: 'Am Weihnachtsmorgen steht auf Omas Fensterbank ein winziger Teller mit Krümeln, und daneben liegt ein Zettel in Wichtelschrift. Du kannst ihn nicht lesen, aber du weißt trotzdem, was daraufsteht.',
  },
  {
    if: { flag: 'schal_verschenkt' },
    text: 'Agathe trägt Großvaters grünen Schal, als sie dir am Weihnachtsmorgen eine Tüte heißer Maronen bringt. „Für mein Glückskind“, sagt sie und kneift dir in die Wange.',
  },
  {
    if: { flag: 'holz_gehackt' },
    text: 'Zur Christmette kommt ein Mann ins Dorf, den seit Jahren niemand gesehen hat: Ruprecht, der Köhler, in einem viel zu engen Sonntagsanzug. Er setzt sich in die letzte Bank und brummt bei jedem Lied mit.',
  },
  {
    if: { flag: 'gloeckchen_zurueck' },
    text: 'In der Krippe hält das Christkind wieder sein Silberglöckchen. Manchmal, wenn die Kirchentür aufgeht, klingt es ganz leise, obwohl niemand es berührt.',
  },
  {
    if: { flag: 'flamme_gestohlen' },
    text: 'Anselm zwinkert dir zu, als du an ihm vorbeigehst. „Das Ewige Licht“, sagt er leise, „hat noch nie jemand gestohlen, Kind. Man kann es nur weitergeben.“',
  },
  {
    if: { flag: 'laterne_von_gustav' },
    text: 'Am ersten Weihnachtstag bringst du Gustav seine Sturmlaterne zurück. Als er sie an den Haken hängt, glimmt darin noch ein Rest Sternenlicht. Er sagt nichts, aber er lässt sie bis Neujahr brennen.',
  },
];

export const stations = [
  {
    id: 'ende_heilige_nacht',
    title: 'Die Heilige Nacht',
    area: 'ende',
    climate: 'warm',
    ending: { number: 1, title: 'Die Heilige Nacht', memory: 'ende_heilige_nacht' },
    text: [
      'Ihr steigt die schmale Leiter hinauf, Oma vorneweg, du mit der Laterne, und der Schneeweber, der sich tief ducken muss, hinterher. Oma öffnet das Glas der Sternlaterne. Du hältst den Funken hinein. Der Schneeweber legt seine gläserne Hand über eure.',
      'Der Funke springt.',
      'Licht. Goldenes, warmes Licht flutet aus der Laterne, durch die Schallöffnungen, über die Dächer, bis hinunter ins Tal. Das Eis am Turm schmilzt mit einem langen Seufzer. Und dann, als hätte sie nur darauf gewartet, beginnt die große Glocke zu läuten. Einmal, zweimal, zwölfmal. Mitternacht.',
      'Unten im Dorf gehen die Türen auf. Menschen treten in den Schnee, Kinder in Nachthemden, Alte in Pantoffeln, und sehen hinauf. Und vom Himmel fällt Schnee. Aber nicht wie sonst: Jede Flocke fängt das Licht der Laterne und glitzert golden, Tausende, Abertausende, und keine gleicht der anderen.',
      'Der Schneeweber steht an der Schallöffnung und sieht hinaus. „Sie sehen sie an“, sagt er. „Sie sehen meine Flocken an.“ Er weint, und seine Tränen sind warm.',
      ...EPILOG,
      '*Und seither schneit es jedes Jahr am Heiligabend über Tannbrück, wenn die Sternlaterne angezündet wird. Golden.*',
    ],
    choices: [],
  },

  {
    id: 'ende_laterne',
    title: 'Die Laterne brennt',
    area: 'ende',
    climate: 'warm',
    ending: { number: 2, title: 'Die Laterne brennt', memory: 'ende_laterne' },
    text: [
      'Du kletterst die Leiter hinauf, öffnest das Glas der Sternlaterne und hältst den Funken hinein.',
      'Der Funke springt, und die Laterne flammt auf. Licht schießt durch die Schallöffnungen, so hell, dass du die Augen schließen musst. Hinter dir hörst du einen Laut wie das Splittern von Glas, wie ein Seufzer, wie Wind, der sich legt.',
      'Als du dich umdrehst, ist der Schneeweber fort. Wo er gestanden hat, sinkt eine Wolke aus feinem Schnee zu Boden, glitzert einen Augenblick im Licht und vergeht.',
      'Der Kokon um Oma zerfällt. Sie schlägt die Augen auf, und du fällst ihr um den Hals. Unter euch beginnt die große Glocke zu läuten, das Eis bricht von ihren Flanken, und sie schlägt zwölf. Unten im Dorf öffnen sich die Türen.',
      'Später, als die Stube warm ist und der Kachelofen knistert, sieht Oma lange aus dem Fenster. „Er war nicht böse, weißt du“, sagt sie leise. „Nur allein.“',
      ...EPILOG,
      '*In diesem Winter fiel kein einziger Schnee mehr.*',
    ],
    choices: [],
  },

  {
    id: 'ende_ewiger_winter',
    title: 'Der ewige Winter',
    area: 'ende',
    climate: 'eisig',
    ending: { number: 3, title: 'Der ewige Winter', memory: 'ende_ewiger_winter' },
    text: [
      'Du hältst ihm die Laterne hin. Der Schneeweber zögert. Dann greift er hinein, mit seinen langen, gläsernen Fingern, und schließt die Hand um den Funken.',
      'Einen Herzschlag lang leuchtet er von innen, golden und warm, und auf seinem Gesicht liegt ein Ausdruck, den du nie vergessen wirst: Staunen. Dann wird das Licht schwächer. Und schwächer. Einen Funken vom Weihnachtsstern kann man nicht festhalten. Man kann ihn nur weitergeben.',
      'Als der Schneeweber die Hand öffnet, ist sie leer.',
      '„Nein“, flüstert er. „Nein, nein …“ Er sinkt neben Oma auf die Knie. Die Glocke bleibt stumm. Die Laterne bleibt dunkel. Draußen fällt Schnee, dicht und lautlos, und deckt alles zu: die Dächer, den Wald, den Kirchturm.',
      'Der Morgen kam nicht.',
      '*Aber das ist eine Geschichte für einen anderen Winter.*',
    ],
    choices: [],
  },

  {
    id: 'ende_zu_spaet',
    title: 'Zu spät',
    area: 'ende',
    climate: 'kalt',
    ending: { number: 4, title: 'Zu spät', memory: 'ende_zu_spaet' },
    text: [
      'Vom Kirchturm schlägt es zwölf. Dünn und gläsern, zwölfmal.',
      'Du bleibst stehen und siehst hinauf. Die Sternlaterne bleibt dunkel. Zum ersten Mal seit Hunderten von Jahren brennt in der Heiligen Nacht kein Licht über Tannbrück. Irgendwo im Dorf bellt ein Hund. Dann ist es still.',
      'Du weißt nicht mehr, wie du zurück in Omas Stube gekommen bist. Du sitzt am Fenster, in eine Decke gewickelt, und wartest. Die ganze Nacht.',
      'Im ersten Morgengrauen geht die Tür. Oma steht im Flur, mit Schnee bis zu den Knien und Eis in den Haaren, durchgefroren, aber lebendig. Als die Glocke zwölf schlug, hat der Schneeweber sie gehen lassen. „Er hat nicht bekommen, was er wollte“, sagt sie müde. „Und wir auch nicht.“',
      {
        if: { flag: 'korb_gefunden' },
        text: 'Du erzählst ihr, dass du ihren Korb am Eissee gefunden hast, und von dem roten Faden. Sie lächelt. „Ich wusste, dass du ihn findest.“',
      },
      'Sie setzt sich zu dir und nimmt deine kalte Hand in ihre beiden. „Nächstes Jahr“, sagt sie. „Nächstes Jahr machen wir es zusammen.“',
    ],
    choices: [],
  },

  {
    id: 'ende_schneeschlaf',
    title: 'Schneeschlaf',
    area: 'ende',
    climate: 'kalt',
    ending: { number: 5, title: 'Schneeschlaf', memory: 'ende_schneeschlaf' },
    text: [
      'Deine Beine wollen nicht mehr. Du setzt dich in den Schnee, nur für einen Augenblick, nur um kurz zu verschnaufen.',
      'Seltsam: Der Schnee ist gar nicht kalt. Er ist weich wie ein Federbett, und eine wohlige Müdigkeit breitet sich in dir aus. Die Flocken fallen dir aufs Gesicht, eine nach der anderen, und jede ist ein kleines Wunder. Du schließt die Augen.',
      'Als du sie wieder öffnest, liegt eine kratzige Wolldecke auf dir, und es riecht nach Kohle und Kräutertee. Du liegst in Gustavs Wärterhäuschen, dicht am bullernden Ofen.',
      {
        if: { flag: 'laterne_von_gustav' },
        text: '„Hab dich nur gefunden, weil meine Laterne im Schnee geleuchtet hat“, sagt Gustav rau. „Sonst …“ Er spricht nicht weiter.',
      },
      {
        if: { notFlag: 'laterne_von_gustav' },
        text: '„Hast Glück gehabt“, brummt Gustav. „Ich hab Spuren im Schnee gesehen, die einfach aufgehört haben. Sonst …“ Er spricht nicht weiter.',
      },
      {
        if: { flag: 'tee_getrunken' },
        text: 'Er drückt dir einen Becher in die Hand. „Thymian und Honig“, sagt er. „Wie gestern.“',
      },
      'Durch das Fenster fällt graues Morgenlicht. Es ist Weihnachtsmorgen. Unten im Tal ragt der Kirchturm in den Himmel, und seine Spitze ist dunkel.',
    ],
    choices: [],
  },

  {
    id: 'ende_heimweg',
    title: 'Heimweg',
    area: 'ende',
    climate: 'warm',
    ending: { number: 6, title: 'Heimweg', memory: 'ende_heimweg' },
    text: [
      'Du steigst wieder ein. Die Tür schlägt hinter dir zu, und der Zug ruckt an. Durch das beschlagene Fenster siehst du den Bahnsteig kleiner werden, das gelbe Licht im Wärterhäuschen, das Dorf unten im Tal.',
      'Ganz kurz meinst du, am Waldrand eine Gestalt zu sehen, hoch und hell wie Mondlicht auf Eis. Dann ist sie fort.',
      'Der Kirchturm von Tannbrück bleibt dunkel, bis die Nacht ihn verschluckt. Du lehnst die Stirn an die kalte Scheibe. Irgendwo im Zug singt jemand ein Weihnachtslied, leise und ein bisschen schief.',
      '*Manche Geschichten beginnen nur, wenn man bleibt.*',
    ],
    choices: [],
  },

  {
    id: 'ende_schneeweber',
    title: 'Der neue Weber',
    area: 'ende',
    climate: 'eisig',
    ending: { number: 7, title: 'Der neue Weber', memory: 'ende_schneeweber' },
    text: [
      '„Lass sie gehen“, sagst du. „Nimm mich stattdessen.“',
      'Der Schneeweber sieht dich lange an. Dann steht er auf. Zum ersten Mal seit tausend Wintern lässt er das Schiffchen los.',
      'Das Bild von Oma löst sich aus dem Gewebe, Faden für Faden, bis sie vor dir auf dem Eis steht, blinzelnd, mit Schnee auf der roten Mütze. „Kind“, sagt sie, „was hast du getan?“ Aber da sitzt du schon am Webstuhl, und das Schiffchen liegt in deiner Hand, als hätte es immer dorthin gehört.',
      'Der Schneeweber geht übers Eis davon. Mit jedem Schritt wird er kleiner und weniger durchsichtig, bis am Ufer nur noch ein alter Mann in einem grauen Mantel steht. Er reibt sich verwundert die Hände und sieht hinunter zum Dorf.',
      'Um Mitternacht flammt über Tannbrück die Sternlaterne auf. Ohne seinen Weber ist das Eissiegel am Kalender geschmolzen, und Oma hat den Funken hinaufgetragen. Du siehst das Licht von hier oben, golden und warm. Zum ersten Mal sieht der Webstuhl es auch.',
      'Du webst. Es ist leichter, als du gedacht hast. Jede Flocke ein Muster, das es nie wieder geben wird. Und in jede legst du einen Gruß nach Tannbrück.',
      'Jedes Jahr am Heiligabend kommt eine alte Frau mit roter Mütze an den See und legt einen Lebkuchen auf das Eis. Du nimmst ihn erst, wenn sie gegangen ist.',
      {
        if: { flag: 'pimpernell_freund' },
        text: 'Manchmal, in klaren Nächten, kommen die Wichtel aus der Mühle und leisten dir Gesellschaft. Pimpernell erzählt dann den neuesten Klatsch aus dem Dorf, und du lachst, und der Schnee, der in diesen Nächten fällt, ist besonders schön.',
      },
    ],
    choices: [],
  },
];
