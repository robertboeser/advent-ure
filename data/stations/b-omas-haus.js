// Bereich B – Omas Haus

const RUNES = ['rune_flamme', 'rune_klang', 'rune_herz'];

export const stations = [
  {
    id: 'omas_haus',
    title: 'Vor Omas Haus',
    area: 'haus',
    climate: 'kalt',
    text: [
      'Omas Haus steht am Rand des Dorfes, ein schiefes Fachwerkhaus mit tief heruntergezogenem Dach. An der grünen Tür hängt ein Kranz aus Tannenzweigen und roten Bändern.',
      { if: { notFlag: 'ofen_an' }, text: 'Kein Licht im Fenster, kein Rauch aus dem Schornstein. Das Haus sieht aus, als hielte es den Atem an.' },
      { if: { flag: 'ofen_an' }, text: 'Aus dem Schornstein steigt Rauch, und hinter dem Stubenfenster glimmt es warm. Fast könnte man glauben, Oma wäre zu Hause.' },
      {
        if: { first: true },
        text: 'Die Tür ist nur angelehnt. Auf der Schwelle wachsen Frostblumen, feine, verästelte Muster, als hätte jemand sie mit Absicht dorthin gestickt.',
      },
    ],
    choices: [
      { label: 'Eintreten', to: 'stube' },
      { label: 'Zum Dorfplatz', to: 'dorfplatz', minutes: 5 },
      { label: 'Den Weg zum Bahnhof hinauf', to: 'dorfweg', minutes: 10 },
    ],
  },

  {
    id: 'stube',
    title: 'Die Stube',
    area: 'haus',
    climate: 'mild',
    text: [
      {
        if: { notFlag: 'ofen_an' },
        text: 'In der Stube ist es fast so kalt wie draußen. Der grüne Kachelofen in der Ecke ist erloschen. Auf dem Tisch stehen zwei Teller, zwei Tassen und eine Schale mit Nüssen, als hätte Oma gerade erst gedeckt und wäre nur kurz hinausgegangen.',
      },
      {
        if: { flag: 'ofen_an' },
        text: 'Im Kachelofen knistert das Feuer, und die Stube füllt sich mit Wärme. Die Uhr an der Wand tickt. Auf dem Tisch stehen zwei Teller und zwei Tassen, für dich und für Oma.',
      },
      {
        if: { hasNot: 'omas_brief' },
        text: 'Zwischen den Tassen liegt ein Briefumschlag. In Omas geschwungener Schrift steht darauf nur ein Wort: *Dir.*',
      },
      'An der Wand neben dem Ofen hängt der Adventskalender, ein geschnitztes Holzhaus mit vierundzwanzig Türen.',
      { if: { all: RUNES.map((flag) => ({ flag })) }, text: 'Aus dem Kalender fällt goldenes Licht durch einen Türspalt.' },
      {
        if: { all: [{ any: RUNES.map((flag) => ({ flag })) }, { not: { all: RUNES.map((flag) => ({ flag })) } }] },
        text: 'Vom Kalender geht ein schwaches Leuchten aus.',
      },
    ],
    choices: [
      {
        label: 'Den Kachelofen anheizen',
        if: { has: 'streichhoelzer', notFlag: 'ofen_an' },
        showLocked: true,
        hint: 'Dafür brauchst du etwas, um Feuer zu machen.',
        minutes: 5,
        effects: { set: ['ofen_an'], attr: { waerme: 3 }, memory: 'ofen' },
        response: 'Der Ofen wird von der Küche aus befeuert, wie früher üblich. Das Anmachholz fängt Feuer, dann die Scheite. Bald knackt und knistert es, und die grünen Kacheln werden warm unter deinen Händen.',
      },
      {
        label: 'Dich am Kachelofen aufwärmen',
        if: { flag: 'ofen_an' },
        once: false,
        minutes: 5,
        effects: { attr: { waerme: 2 } },
        response: 'Du lehnst den Rücken an die warmen Kacheln, wie früher als Kind, und schließt für einen Moment die Augen.',
      },
      { label: 'Den Brief lesen', to: 'omas_brief', if: { hasNot: 'omas_brief' } },
      { label: 'Den Adventskalender betrachten', to: 'adventskalender' },
      { label: 'In die Küche', to: 'kueche' },
      { label: 'Die Stiege zum Dachboden hinauf', to: 'dachboden' },
      { label: 'Hinaus vor das Haus', to: 'omas_haus' },
    ],
  },

  {
    id: 'omas_brief',
    title: 'Omas Brief',
    area: 'haus',
    climate: 'mild',
    text: [
      'Du öffnest den Umschlag. Das Papier riecht nach Zimt und ein wenig nach Ofenrauch.',
      '*Mein liebes Kind,*',
      '*wenn Du dies liest, bin ich dem Schneeweber nachgegangen. Er war gestern Nacht hier, ich habe ihn am Fenster gesehen, groß und hell wie Mondlicht auf Eis. Er hat Frost über die vierundzwanzigste Tür gelegt. Ohne den Funken bleibt die Laterne dunkel, und ich fürchte, dann bleibt es auch der Winter.*',
      '*Frost weicht nur dreierlei: dem Feuer, das nie erlischt, dem Klang, der Herzen ruft, und der Gabe, die ohne Grund gegeben wird.*',
      '*Sei nicht bange. Und sei freundlich zu allen, denen Du begegnest, auch zu denen, die Dir seltsam vorkommen. Die Lebkuchen sind in der blauen Dose in der Küche. Iss nicht alle auf einmal.*',
      '*Deine Oma*',
    ],
    choices: [
      {
        label: 'Den Brief einstecken',
        to: 'stube',
        minutes: 5,
        effects: { give: { omas_brief: 1 }, set: ['brief_gelesen'], memory: 'brief' },
      },
    ],
  },

  {
    id: 'kueche',
    title: 'Omas Küche',
    area: 'haus',
    climate: 'mild',
    text: [
      'Omas Küche riecht nach Zimt, Nelken und Butter. Über dem Herd hängen Kräuterbündel, auf dem Fensterbrett stehen Gläser mit eingemachten Kirschen. Die Scheiben sind von außen mit Eisblumen bedeckt.',
      { if: { notFlag: 'kueche_dose' }, text: 'Auf dem Herd steht die blaue Blechdose, von der Oma geschrieben hat.' },
      { if: { notFlag: 'kueche_zimtsterne' }, text: 'Daneben liegt ein Päckchen Zimtsterne in Butterbrotpapier.' },
      { if: { notFlag: 'kueche_hoelzer' }, text: 'Auf dem Sims über dem Herd liegt eine Schachtel Streichhölzer.' },
      { if: { notFlag: 'ofen_an' }, text: 'Die Feuerklappe in der Wand führt zum Kachelofen in der Stube. Der Herd ist kalt.' },
      { if: { flag: 'ofen_an' }, text: 'Durch die Feuerklappe zum Kachelofen fällt ein roter Schein, und die Herdplatte ist warm geworden.' },
    ],
    choices: [
      {
        label: 'Die Streichhölzer vom Sims nehmen',
        effects: { give: { streichhoelzer: 1 }, set: ['kueche_hoelzer'] },
      },
      {
        label: 'Die blaue Dose öffnen',
        effects: { give: { lebkuchen: 3 }, set: ['kueche_dose'] },
        response: 'In der Dose liegen drei Lebkuchen, dick mit Schokolade überzogen, auf jedem ein Mandelstern. Du denkst an Omas Brief: *Iss nicht alle auf einmal.*',
      },
      {
        label: 'Die Zimtsterne einpacken',
        effects: { give: { zimtsterne: 1 }, set: ['kueche_zimtsterne'] },
      },
      {
        label: 'Milch auf dem Herd wärmen und trinken',
        if: { flag: 'ofen_an' },
        showLocked: true,
        hint: 'Der Herd ist kalt.',
        minutes: 5,
        effects: { attr: { waerme: 2 } },
        response: 'Du wärmst Milch in Omas kleinem Emailletopf und rührst einen Löffel Honig hinein. Sie schmeckt wie früher.',
      },
      { label: 'Zurück in die Stube', to: 'stube' },
    ],
  },

  {
    id: 'dachboden',
    title: 'Der Dachboden',
    area: 'haus',
    climate: 'kalt',
    text: [
      'Die Stiege knarrt bei jedem Schritt. Oben ist es eisig. Durch eine kleine Dachluke fällt Mondlicht auf Staub, Spinnweben und vergessene Dinge: einen Schaukelstuhl, einen Stapel Hutschachteln, ein Schaukelpferd mit abgeblätterter Farbe.',
      'Unter der Dachschräge steht Großvaters alte Truhe mit den eisernen Beschlägen.',
      {
        if: { notFlag: ['pimpernell_freund', 'pimpernell_verscheucht'] },
        text: 'Aus einer Ecke hinter den Hutschachteln kommt ein Rascheln. Dann ist es still. Zu still, als hätte jemand die Luft angehalten.',
      },
      {
        if: { flag: 'pimpernell_freund' },
        text: 'Die Ecke hinter den Hutschachteln ist leer. Nur ein paar Lebkuchenkrümel erinnern an Pimpernell.',
      },
    ],
    choices: [
      { label: 'Die alte Truhe öffnen', to: 'dachboden_truhe' },
      {
        label: 'Dem Rascheln nachgehen',
        to: 'dachboden_wichtel',
        if: { notFlag: ['pimpernell_freund', 'pimpernell_verscheucht'] },
      },
      { label: 'Hinunter in die Stube', to: 'stube' },
    ],
  },

  {
    id: 'dachboden_truhe',
    title: 'Großvaters Truhe',
    area: 'haus',
    climate: 'kalt',
    text: [
      'Der Deckel der Truhe ist schwer. Es riecht nach Mottenkugeln und altem Holz. Obenauf liegen Briefe, mit einer roten Schnur gebündelt.',
      {
        if: { notFlag: 'truhe_schal' },
        text: 'Darunter liegt Großvaters Wollschal, dunkelgrün, mit eingestrickten Hirschen. Oma hat ihn all die Jahre aufgehoben.',
      },
      {
        if: { notFlag: 'truhe_spieldose' },
        text: 'Ganz unten, in ein Tuch gewickelt, findest du eine kleine Spieldose aus Nussholz. Auf dem Deckel ist ein Stern eingelegt. Du drehst die Kurbel, aber es klickt nur leise. Innen fehlt ein Zahnrad.',
      },
      {
        if: { notFlag: 'truhe_laterne', hasNot: 'laterne' },
        text: 'In der Ecke der Truhe steht eine alte Stalllaterne mit einem Sprung im Glas.',
      },
    ],
    choices: [
      {
        label: 'Den Wollschal umlegen',
        effects: { give: { schal: 1 }, set: ['truhe_schal'] },
        response: 'Der Schal ist kratzig und warm und riecht ein wenig nach Großvaters Pfeifentabak. Du wickelst ihn zweimal um den Hals.',
      },
      {
        label: 'Die Spieldose mitnehmen',
        effects: { give: { spieldose_kaputt: 1 }, set: ['truhe_spieldose'] },
        response: 'Du steckst die Spieldose vorsichtig in die Manteltasche. Irgendwer wird sie reparieren können.',
      },
      {
        label: 'Die Stalllaterne nehmen',
        if: { hasNot: 'laterne' },
        effects: { give: { laterne: 1 }, set: ['truhe_laterne'], memory: 'laterne' },
        response: 'Die Laterne quietscht, als du den Bügel hochklappst, aber der Docht ist gut. Für eine Flamme wird sie reichen.',
      },
      { label: 'Die Truhe schließen', to: 'dachboden' },
    ],
  },

  {
    id: 'dachboden_wichtel',
    title: 'Pimpernell',
    area: 'haus',
    climate: 'kalt',
    text: [
      'Du schiebst eine Hutschachtel beiseite. Dahinter, zwischen Wollknäueln und alten Zeitungen, kauert ein Wichtel, kaum größer als deine Hand. Seine rote Zipfelmütze ist ihm über ein Auge gerutscht, und er zittert am ganzen Leib.',
      '„Nicht hauen!“, piepst er. „Ich bin Pimpernell, ich tu nix, ich wohn nur hier, seit gestern, weil … weil bei uns in der Mühle alles zugefroren ist. Der Schneeweber war da. Alles Eis, sogar das Mühlrad.“',
      'Sein Magen knurrt, laut wie eine Kaffeemühle. Er schaut verlegen zur Seite.',
    ],
    choices: [
      {
        label: 'Ihm einen Lebkuchen schenken',
        to: 'dachboden',
        if: { has: 'lebkuchen' },
        showLocked: true,
        hint: 'Du hast nichts, was du ihm geben könntest.',
        effects: { take: { lebkuchen: 1 }, attr: { guete: 1 }, set: ['pimpernell_freund'], memory: 'pimpernell' },
        response: 'Pimpernell starrt erst den Lebkuchen an, dann dich. Dann beißt er hinein, so kräftig, dass ihm die Backen platzen. „Du bisch nett“, nuschelt er mit vollem Mund. „Nett wie die Ilse. Pass auf: Ich lauf voraus zur Mühle und sag dem Rat, dass du ein Freund bist. Und wenn du zur Kirche willst, ich kenn da eine Abkürzung!“ Und schon ist er durch eine Ritze in der Wand verschwunden.',
      },
      {
        label: '„Husch, verschwinde!“',
        to: 'dachboden',
        effects: { attr: { guete: -1 }, set: ['pimpernell_verscheucht'] },
        response: 'Pimpernell quiekt und flitzt davon, durch eine Ritze in der Dielenwand. Zurück bleibt nur ein bisschen Staub, der im Mondlicht tanzt.',
      },
      {
        label: 'Dich leise zurückziehen',
        to: 'dachboden',
        response: 'Du lässt den kleinen Kerl in Ruhe. Hinter dir hörst du ihn erleichtert seufzen.',
      },
    ],
  },

  {
    id: 'adventskalender',
    title: 'Der Adventskalender',
    area: 'haus',
    climate: 'mild',
    text: [
      'Der Kalender ist größer, als du ihn in Erinnerung hast: ein geschnitztes Holzhaus mit Giebeln, Fensterläden und einem winzigen Schornstein. Dreiundzwanzig Türen stehen offen. Hinter jeder liegt eine Schnitzerei, so klein, dass du dich vorbeugen musst: ein Schlitten, ein Stern, eine Katze am Ofen, ein Fuchs im Schnee …',
      {
        if: { not: { all: RUNES.map((flag) => ({ flag })) } },
        text: 'Die vierundzwanzigste Tür ist hinter einer Schicht aus Eis verschwunden. Das Eis ist kunstvoll gewebt, Faden um Faden, wie Spitze. Darin glimmen drei Zeichen: eine Flamme, eine Glocke, ein Herz.',
      },
      { if: { notFlag: 'rune_flamme' }, text: 'Die Flamme ist blau vor Kälte.' },
      { if: { flag: 'rune_flamme' }, text: 'Die Flamme ist getaut und glüht in warmem Orange.' },
      { if: { notFlag: 'rune_klang' }, text: 'Die Glocke ist stumm und starr.' },
      { if: { flag: 'rune_klang' }, text: 'Die Glocke schimmert silbern. Wenn du genau hinhörst, klingt sie leise nach.' },
      { if: { notFlag: 'rune_herz' }, text: 'Das Herz ist von dickem Raureif überzogen.' },
      { if: { flag: 'rune_herz' }, text: 'Das Herz leuchtet rot wie ein Bratapfel.' },
      {
        if: { all: RUNES.map((flag) => ({ flag })) },
        text: 'Das Eis ist fort. Die vierundzwanzigste Tür ist nur noch angelehnt, und durch den Spalt fällt goldenes Licht.',
      },
      {
        if: { notFlag: 'brief_gelesen' },
        text: 'Als du die Hand auf das Siegel legst, ist es so kalt, dass es brennt. Vielleicht weiß Omas Brief, was hier zu tun ist.',
      },
    ],
    choices: [
      {
        label: 'Die Flammenrune mit der Flamme des Ewigen Lichts tauen',
        if: { has: 'kirchenflamme', notFlag: 'rune_flamme' },
        minutes: 5,
        effects: { set: ['rune_flamme'] },
        response: 'Du hältst die Laterne an das Siegel. Die rote Flamme beugt sich zum Eis, als wüsste sie, was zu tun ist. Das Eis um die Flammenrune zischt, schmilzt und tropft auf die Dielen.',
      },
      {
        label: 'Die Flammenrune mit der Köhlerglut tauen',
        if: { has: 'glut', notFlag: 'rune_flamme' },
        minutes: 5,
        effects: { set: ['rune_flamme'] },
        response: 'Du hältst die Laterne an das Siegel. Die Glut flammt auf, als hätte jemand hineingepustet. Das Eis um die Flammenrune zischt, schmilzt und tropft auf die Dielen.',
      },
      {
        label: 'Die Spieldose am Siegel spielen',
        if: { has: 'spieldose', notFlag: 'rune_klang' },
        minutes: 5,
        sfx: 'spieldose',
        effects: { set: ['rune_klang'] },
        response: 'Du ziehst die Spieldose auf. Omas Wiegenlied perlt durch die Stube, und das Eis um die Glockenrune singt leise mit, bevor es zerfließt.',
      },
      {
        label: 'Das Silberglöckchen läuten',
        if: { has: 'silberglocke', notFlag: 'rune_klang' },
        minutes: 5,
        sfx: 'glocke',
        effects: { set: ['rune_klang'] },
        response: 'Das Glöckchen klingt so hell, dass dir die Tränen kommen. Das Eis um die Glockenrune bekommt feine Risse und rieselt zu Boden.',
      },
      {
        label: 'Den Strohstern auf die Herzrune legen',
        if: { has: 'strohstern', notFlag: 'rune_herz' },
        minutes: 5,
        effects: { set: ['rune_herz'] },
        response: 'Du legst den Strohstern auf das Herz. Einen Augenblick geschieht nichts. Dann wird der Raureif durchsichtig und rinnt wie Tränen am Holz hinab.',
      },
      {
        label: 'Die vierundzwanzigste Tür öffnen',
        to: 'tuer_24',
        if: { flag: RUNES },
      },
      { label: 'Zurück in die Stube', to: 'stube' },
    ],
  },

  {
    id: 'tuer_24',
    title: 'Die vierundzwanzigste Tür',
    area: 'haus',
    climate: 'warm',
    onEnter: { memory: 'tuer_24' },
    text: [
      'Du legst den Finger an die kleine Tür. Sie schwingt auf, ganz leicht, als hätte sie nur auf dich gewartet.',
      'Dahinter, auf einem Bett aus Watte, liegt ein Licht. Es ist kleiner als eine Haselnuss und heller als jede Kerze. Langsam hebt es sich in die Luft, schwebt vor deinem Gesicht und summt, ganz leise, einen Ton, den du schon immer gekannt hast. Die Stube wird warm, bis in den letzten Winkel.',
      'Dann siehst du im Licht des Funkens ein Bild, wie durch ein Fenster: den Kirchturm, umsponnen von Eis. Eine hohe, durchscheinende Gestalt steigt die Stufen hinauf. In ihren Armen trägt sie etwas, eingehüllt in weißen Schnee, und unter dem Schnee siehst du eine rote Mütze. *Oma.*',
      'Das Bild verblasst. Der Funke schwebt zu dir und wartet.',
    ],
    choices: [
      {
        label: 'Den Funken in die Laterne setzen und zur Kirche eilen',
        to: 'kirche_vorplatz',
        minutes: 10,
        effects: { give: { lichtfunke: 1 } },
      },
    ],
  },
];
