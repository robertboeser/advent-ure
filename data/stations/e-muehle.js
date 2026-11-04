// Bereich E – Die alte Mühle

export const stations = [
  {
    id: 'muehlweg',
    title: 'Am gefrorenen Bach',
    area: 'muehle',
    climate: 'kalt',
    text: [
      'Der Bachweg führt am Dorfrand entlang hinauf zur alten Mühle. Der Bach selbst ist zugefroren. Unter dem Eis hörst du das Wasser gluckern, gedämpft wie aus einem anderen Zimmer. Die Weiden am Ufer beugen sich unter der Last des Eises bis zum Boden.',
      {
        if: { notFlag: 'eis_gebrochen' },
        text: 'Der Weg macht einen weiten Bogen um eine Biegung des Bachs. Quer über das Eis wäre es kürzer, viel kürzer. Das Eis glänzt im Mondlicht, glatt und schwarz.',
      },
      {
        if: { flag: 'eis_gebrochen' },
        text: 'Mitten auf dem Bach klafft ein dunkles Loch im Eis, dort, wo du eingebrochen bist. Allein der Anblick lässt dich frösteln.',
      },
    ],
    choices: [
      { label: 'Dem Weg zur Mühle folgen', to: 'muehle_aussen', minutes: 10 },
      { label: 'Über das Eis abkürzen', to: 'eis_bricht', minutes: 5, if: { notFlag: 'eis_gebrochen' }, sfx: 'eis' },
      { label: 'Zurück zum Dorfplatz', to: 'dorfplatz', minutes: 10 },
    ],
  },

  {
    id: 'eis_bricht',
    title: 'Kalte Füße',
    area: 'muehle',
    climate: 'eisig',
    onEnter: { set: ['eis_gebrochen'], memory: 'kalte_fuesse' },
    text: [
      'Die ersten Schritte gehen gut. Das Eis trägt, und du kommst schnell voran. Dann, in der Mitte, hörst du ein Geräusch wie einen Peitschenknall.',
      'Es kracht. Der Boden unter dir gibt nach, und du brichst ein, bis über die Knie. Das Wasser ist so kalt, dass dir für einen Moment die Luft wegbleibt. Du krallst dich an der Eiskante fest, ziehst dich hoch, rutschst ab, ziehst dich wieder hoch.',
    ],
    choices: [
      { label: 'Dich triefend ans Ufer retten', to: 'muehle_aussen', effects: { attr: { waerme: -3 } } },
    ],
  },

  {
    id: 'muehle_aussen',
    title: 'Die alte Mühle',
    area: 'muehle',
    climate: 'eisig',
    text: [
      'Die alte Mühle duckt sich an den Hang, ein Fachwerkbau mit moosigem Dach.',
      {
        if: { notFlag: 'muehle_frei' },
        text: 'Das große Mühlrad steht still. Es steckt in einem Panzer aus Eis, aber nicht aus gewöhnlichem Eis: Es ist gewebt, Faden für Faden, in Mustern aus Sternen und Ranken, wie die feinste Spitze.',
      },
      {
        if: { notFlag: 'muehle_frei' },
        text: 'Hinter den kleinen Fenstern huschen winzige Lichter hin und her, kaum größer als Glühwürmchen. Dann erlöschen sie, eines nach dem anderen, als hätte jemand gerufen: *Achtung!*',
      },
      {
        if: { flag: 'muehle_frei' },
        text: 'Das Mühlrad dreht sich wieder, langsam und knarrend, und Wasser plätschert über die Schaufeln. In allen Fenstern brennen winzige Lichter, und von drinnen hörst du Gesang.',
      },
    ],
    choices: [
      { label: 'Durch die knarrende Tür hinein', to: 'muehle_innen' },
      { label: 'Durch das Fensterchen spähen', to: 'muehle_fenster', if: { notFlag: ['wichtel_beobachtet', 'muehle_frei'] } },
      { label: 'Zurück zum Bach', to: 'muehlweg', minutes: 10 },
    ],
  },

  {
    id: 'muehle_fenster',
    title: 'Ein Blick hinein',
    area: 'muehle',
    climate: 'eisig',
    text: [
      'Du wischst den Raureif von der Scheibe und spähst hinein. Im Schein eines Fingerhuts voll Kerzenwachs sitzen ein Dutzend Wichtel im Kreis auf Mehlsäcken. In ihrer Mitte, auf einem umgedrehten Becher, steht ein silbernes Glöckchen.',
      '„Solange es klingt, kommt der Frost nicht herein!“, ruft ein Wichtel mit einem Bart bis zu den Knien. Ein anderer läutet das Glöckchen, und tatsächlich: Die Eisblumen am Fenster weichen ein Stückchen zurück. „Aber es gehört dem Christkind“, piepst ein dritter. „Geborgt ist geborgt!“, schnauzt der Bärtige.',
      'Dann dreht sich einer der Wichtel zum Fenster um, und du duckst dich schnell.',
    ],
    choices: [
      { label: 'Dich vom Fenster lösen', to: 'muehle_aussen', effects: { set: ['wichtel_beobachtet'] } },
    ],
  },

  {
    id: 'muehle_innen',
    title: 'In der Mühle',
    area: 'muehle',
    climate: 'mild',
    text: [
      'Drinnen ist es dämmrig und mehlig, und es riecht nach Getreide und altem Holz. Durch die Ritzen der Bretterwand fällt Mondlicht in schmalen Streifen.',
      {
        if: { notFlag: ['pimpernell_freund', 'zimtsterne_geschenkt'] },
        text: 'Alles ist still, zu still. Du spürst, dass dich viele kleine Augen beobachten. Hinter einem Mehlsack kichert jemand und verstummt sofort.',
      },
      {
        if: { flag: 'pimpernell_freund', first: true },
        text: '„Da bist du ja!“ Pimpernell springt von einem Balken und landet in einer Mehlwolke. „Ich hab allen gesagt, dass du ein Freund bist. Komm, der Rat wartet!“',
      },
      {
        if: { flag: 'zimtsterne_geschenkt', notFlag: 'pimpernell_freund' },
        text: 'Vom Mühlstein sind die Zimtsterne verschwunden. Aus den Schatten treten ein paar Wichtel, die Münder voller Krümel. „Du darfst zum Rat“, sagt einer feierlich.',
      },
      'Hinten im Raum, zwischen den mächtigen Balken, ragt das Mahlwerk auf.',
    ],
    choices: [
      {
        label: 'Zimtsterne auf den Mühlstein legen',
        if: { has: 'zimtsterne', notFlag: 'zimtsterne_geschenkt' },
        effects: { take: { zimtsterne: 1 }, attr: { guete: 1 }, set: ['zimtsterne_geschenkt'] },
        response: 'Du legst die Zimtsterne auf den großen Mühlstein und trittst einen Schritt zurück. Eine Weile passiert nichts. Dann schnuppert es aus allen Ecken, und eine kleine Hand nach der anderen greift aus dem Dunkel.',
      },
      {
        label: '„Hallo? Ist da jemand?“ rufen',
        if: { notFlag: ['pimpernell_freund', 'zimtsterne_geschenkt'] },
        response: 'Von einem Balken über dir rieselt eine Ladung Mehl auf deinen Kopf. Irgendwo kichert es. Sonst geschieht nichts.',
      },
      {
        label: 'Zum Wichtelrat gehen',
        to: 'wichtelrat',
        if: { any: [{ flag: 'pimpernell_freund' }, { flag: 'zimtsterne_geschenkt' }] },
        showLocked: true,
        hint: 'Die Wichtel verstecken sich vor Fremden. Vielleicht lassen sie sich anlocken – oder jemand legt ein gutes Wort für dich ein.',
      },
      { label: 'Das Mahlwerk untersuchen', to: 'mahlwerk' },
      { label: 'Hinaus', to: 'muehle_aussen' },
    ],
  },

  {
    id: 'wichtelrat',
    title: 'Der Wichtelrat',
    area: 'muehle',
    climate: 'mild',
    onEnter: { memory: 'wichtelrat' },
    text: [
      {
        if: { first: true },
        text: 'Auf einem Mehlsack, der für ihn so groß ist wie ein Thron, sitzt ein uralter Wichtel mit einem weißen Bart, der ihm bis über die Knie reicht. „Ich bin Großvater Haselbart“, sagt er mit erstaunlich tiefer Stimme. „Ältester der Mühlenwichtel. Du hast das Herz am rechten Fleck, sagt man.“',
      },
      {
        if: { first: true },
        text: '„Wir Wichtel lieben drei Dinge“, fährt er fort. „Musik, Süßes und ein Mühlrad, das sich dreht. Das Letzte hat uns der Schneeweber genommen.“',
      },
      {
        if: { first: false, notFlag: 'muehle_frei' },
        text: 'Großvater Haselbart thront auf seinem Mehlsack und nickt dir würdevoll zu.',
      },
      {
        if: { notFlag: 'muehle_frei' },
        text: 'Um ihn herum sitzen die Wichtel des Rates und mustern dich neugierig. In ihrer Mitte, auf einem umgedrehten Becher, glänzt ein Silberglöckchen.',
      },
      {
        if: { flag: 'wichtel_beobachtet', notFlag: 'muehle_frei' },
        text: 'Du erkennst das Glöckchen sofort: Es ist das aus der Krippe.',
      },
      {
        if: { flag: 'muehle_frei' },
        text: 'Seit sich das Mühlrad wieder dreht, sind die Wichtel nicht wiederzuerkennen. Sie singen, tanzen auf den Balken und werfen sich Mehl zu. Sogar Großvater Haselbart wippt mit dem Fuß.',
      },
    ],
    choices: [
      {
        label: 'Um Reparatur der Spieldose bitten',
        if: { has: 'spieldose_kaputt' },
        minutes: 10,
        sfx: 'spieldose',
        effects: { take: { spieldose_kaputt: 1 }, give: { spieldose: 1 }, memory: 'spieldose' },
        response: 'Haselbart klatscht in die Hände, und drei Wichtel stürzen sich auf die Spieldose. Es wird geschraubt, gefeilt und gestritten. Einer läuft davon und kommt mit einem winzigen Zahnrad zurück, das er aus einer alten Taschenuhr gebrochen hat. Dann klickt es, und Omas Wiegenlied erklingt. Alle Wichtel halten still und lauschen. Einem kullert eine Träne in den Bart.',
      },
      {
        label: 'Nach dem Silberglöckchen fragen',
        if: { notFlag: 'muehle_frei' },
        response: 'Haselbart legt schützend die Hand auf das Glöckchen. „Geborgt“, sagt er, „nur geborgt. Sein Klang hält uns den Frost vom Leib. Solange das Mühlrad eingefroren ist, brauchen wir es. Befrei unser Mühlrad, und das Glöckchen gehört dir. Wichtelwort.“',
      },
      {
        label: 'Das Mühlrad mit deiner Flamme befreien',
        if: { ref: 'hat_flamme', notFlag: 'muehle_frei' },
        showLocked: true,
        hint: 'Dafür bräuchtest du ein Feuer, das nicht erlischt.',
        minutes: 5,
        sfx: 'glocke',
        effects: { set: ['muehle_frei'], attr: { guete: 1 }, give: { silberglocke: 1 }, memory: 'silberklang' },
        response: 'Die Wichtel führen dich durch eine Luke hinaus zum Mühlrad. Du hältst die Laterne an das gewebte Eis. Die Flamme frisst sich durch die Fäden, einen nach dem anderen, bis das ganze Gespinst mit einem Seufzer zu Wasser zerfällt. Ächzend setzt sich das Rad in Bewegung. Die Wichtel jubeln so laut, dass es der Mond hören muss, und Haselbart drückt dir das Silberglöckchen in die Hand. „Wichtelwort ist Wichtelwort.“',
      },
      {
        label: 'Dich für die Gastfreundschaft bedanken',
        if: { flag: 'zimtsterne_geschenkt', hasNot: 'strohstern' },
        effects: { give: { strohstern: 1 } },
        response: 'Haselbart winkt ab. „Du hast uns Zimtsterne geschenkt, ohne etwas dafür zu verlangen. So etwas vergessen Wichtel nicht.“ Auf seinen Wink überreicht dir ein Wichtel feierlich einen kleinen Stern aus geflochtenem Stroh. „Aus dem Stroh der Krippe“, flüstert er. „Aber nicht weitersagen.“',
      },
      { label: 'Dich verabschieden', to: 'muehle_innen' },
    ],
  },

  {
    id: 'mahlwerk',
    title: 'Das Mahlwerk',
    area: 'muehle',
    climate: 'mild',
    text: [
      {
        if: { notFlag: 'muehle_frei' },
        text: 'Das Mahlwerk ist ein Wald aus Holz: Wellen, so dick wie Baumstämme, Zahnräder mit Zähnen aus Hainbuche, ein Mühlstein, groß wie ein Wagenrad. Alles steht still und ist von Raureif überzogen.',
      },
      {
        if: { flag: 'muehle_frei' },
        text: 'Seit das Rad sich dreht, rumpelt und rattert das Mahlwerk wieder. Wellen, so dick wie Baumstämme, drehen sich, und der Boden zittert unter deinen Füßen.',
      },
      'Zu deinen Füßen entdeckst du eine Falltür mit einem eisernen Ring.',
      {
        if: { flag: 'pimpernell_freund' },
        text: '„Da unten geht’s zur Kirche“, flüstert Pimpernell, der plötzlich neben dir steht. „Der alte Mehlweg der Mönche. Früher haben die da das Mehl für die Hostien durchgetragen. Kürzer geht’s nicht!“',
      },
      {
        if: { notFlag: 'pimpernell_freund' },
        text: 'Der Ring ist festgefroren, und die Klappe rührt sich keinen Fingerbreit. Wer weiß, wohin sie führt.',
      },
    ],
    choices: [
      { label: 'Pimpernell durch die Falltür folgen', to: 'geheimgang', if: { flag: 'pimpernell_freund' } },
      { label: 'Zurück', to: 'muehle_innen' },
    ],
  },

  {
    id: 'geheimgang',
    title: 'Der Mehlweg',
    area: 'muehle',
    climate: 'mild',
    onEnter: { memory: 'geheimgang' },
    text: [
      'Hinter der Falltür führt eine steile Holzleiter in die Tiefe. Unten beginnt ein niedriger Gang aus groben Feldsteinen. Von der Decke hängen Wurzeln, und es riecht nach Erde und, ganz schwach, nach Weihrauch.',
      'Pimpernell läuft voraus, eine Laterne kaum größer als ein Fingerhut in der Hand. „Gleich da“, flüstert er immer wieder. „Gleich da, gleich da.“ Nach einer Weile steigt der Gang an, und über euch hörst du Orgelpfeifen leise im Luftzug summen.',
    ],
    choices: [
      {
        label: 'Durch die Klappe hinter dem Altar steigen',
        to: 'kirchenschiff',
        minutes: 5,
        response: 'Du stemmst eine Holzklappe auf und kletterst hinter dem Altar hervor. Pimpernell winkt dir noch einmal zu und ist verschwunden.',
      },
    ],
  },
];
