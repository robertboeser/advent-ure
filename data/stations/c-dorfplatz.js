// Bereich C – Dorfplatz

export const stations = [
  {
    id: 'dorfplatz',
    title: 'Der Dorfplatz',
    area: 'dorf',
    climate: 'kalt',
    text: [
      'Die Buden des Weihnachtsmarkts sind mit Planen verhängt, an ihren Dachkanten hängen Eiszapfen. Der große Christbaum in der Mitte des Platzes ist dunkel; niemand hat in dieser Nacht seine Kerzen angezündet. Aus dem Brunnen ragen Eiszapfen wie ausgestreckte Hände.',
      {
        if: { first: true },
        text: 'Die Fensterläden der Häuser sind geschlossen. Hinter manchen glimmt Kerzenlicht, aber niemand ist draußen. Es ist, als hielte das ganze Dorf den Atem an und warte auf etwas.',
      },
      {
        if: { notFlag: 'agathe_ofen' },
        text: 'Am Rand des Platzes sitzt eine alte Frau auf einem Schemel, neben sich einen erkalteten Maronenofen. Sie hat sich in drei Tücher gewickelt und rührt sich kaum.',
      },
      {
        if: { flag: 'agathe_ofen' },
        text: 'Am Rand des Platzes glüht Agathes Maronenofen. Es duftet nach gerösteten Kastanien, und die alte Frau winkt dir zu.',
      },
      {
        if: { has: 'lichtfunke' },
        text: 'Der Funke in deiner Laterne spiegelt sich in tausend Eiskristallen. Hinter einem Fenster drückt ein Kind die Nase an die Scheibe und starrt dir mit großen Augen nach.',
      },
      'Die Gasse hinauf führt zur Kirche, der Bachweg zur alten Mühle, und hinter den letzten Häusern beginnt der Wald.',
    ],
    choices: [
      { label: 'Zur Maronenfrau gehen', to: 'agathe' },
      { label: 'Die Gasse hinauf zur Kirche', to: 'kirche_vorplatz', minutes: 5 },
      { label: 'Den Bachweg zur alten Mühle', to: 'muehlweg', minutes: 10 },
      { label: 'Hinaus zum Waldrand', to: 'waldrand', minutes: 15 },
      { label: 'Zu Omas Haus', to: 'omas_haus', minutes: 5 },
      { label: 'Den Weg zum Bahnhof hinauf', to: 'dorfweg', minutes: 10 },
    ],
  },

  {
    id: 'agathe',
    title: 'Die Maronenfrau',
    area: 'dorf',
    climate: 'kalt',
    text: [
      {
        if: { first: true },
        text: '„Ach, ein junges Gesicht“, sagt die alte Frau, als du näherkommst. Ihre Stimme klingt wie trockenes Laub. „Ich bin Agathe. Seit fünfzig Jahren verkaufe ich hier Maronen, aber heute will der Ofen nicht brennen. Alles ist klamm vor Kälte, sogar meine Streichhölzer.“',
      },
      {
        if: { first: false, notFlag: 'agathe_ofen' },
        text: 'Agathe sitzt noch immer zusammengekauert neben ihrem kalten Ofen. Ihre Finger sind blau vor Kälte.',
      },
      {
        if: { flag: 'agathe_ofen' },
        text: 'Agathe hält die Hände über ihren glühenden Maronenofen. „Es geht doch nichts über ein bisschen Feuer“, sagt sie zufrieden.',
      },
      {
        if: { flag: 'schal_verschenkt' },
        text: 'Sie trägt Großvaters grünen Schal und streicht immer wieder darüber, als könne sie es nicht glauben.',
      },
      {
        if: { notFlag: 'legende_agathe' },
        text: 'Ihr Blick wandert zum dunklen Kirchturm. „Er war hier, weißt du“, murmelt sie. „Der Schneeweber. Ich hab ihn gesehen, gestern Nacht, wie er durch die Gassen ging.“',
      },
    ],
    choices: [
      {
        label: 'Nach dem Schneeweber fragen',
        minutes: 5,
        effects: { set: ['legende_agathe'] },
        response: '„Als ich ein Mädchen war, hat meine Großmutter von ihm erzählt“, sagt Agathe. „Er sitzt oben am Eissee an seinem Webstuhl und webt jede Flocke, die vom Himmel fällt. Tausend Winter schon. Keine gleicht der anderen, jede ist ein kleines Wunder. Aber die Leute schimpfen nur über den Schnee, schippen ihn weg und fluchen.“ Sie schüttelt den Kopf. „Keiner hat ihm je gedankt. Kein einziges Mal. Ich glaube, er ist nicht böse, Kind. Nur sehr, sehr allein. Und Alleinsein macht kalt.“',
      },
      {
        label: 'Ihren Maronenofen anzünden',
        if: { has: 'streichhoelzer' },
        showLocked: true,
        hint: 'Du hast nichts, um Feuer zu machen.',
        minutes: 5,
        effects: { set: ['agathe_ofen'], attr: { waerme: 1 }, give: { maronen: 1 } },
        response: 'Du reißt ein Streichholz an und schützt es mit der hohlen Hand. Beim dritten Versuch fängt das Anmachholz Feuer. Agathe lacht leise, ein Lachen wie von einem jungen Mädchen. Bald knistern die Kastanien auf dem Blech, und sie drückt dir eine heiße Tüte in die Hand. „Für dich. Ohne dich säß ich hier noch bis Neujahr.“',
      },
      {
        label: 'Ihr einen Lebkuchen schenken',
        if: { has: 'lebkuchen', notFlag: 'agathe_beschenkt' },
        effects: {
          take: { lebkuchen: 1 },
          attr: { guete: 1 },
          set: ['agathe_beschenkt'],
          give: { strohstern: 1 },
          memory: 'agathe_stern',
        },
        response: 'Agathe betrachtet den Lebkuchen in ihrer Hand, als wäre er aus Gold. „Für mich? Einfach so?“ Ihre Augen werden feucht. Dann kramt sie in ihrer Schürzentasche und legt dir etwas in die Hand: einen kleinen Stern aus geflochtenem Stroh. „Den hab ich als Kind gemacht. Er gehört dem, der gibt, ohne zu fragen. Das war schon immer so.“',
      },
      {
        id: 'schal_mit_stern',
        label: 'Ihr deinen Schal umlegen',
        if: { has: 'schal', notFlag: ['schal_verschenkt', 'agathe_beschenkt'] },
        effects: {
          take: { schal: 1 },
          attr: { guete: 2 },
          set: ['schal_verschenkt', 'agathe_beschenkt'],
          give: { strohstern: 1 },
          memory: 'agathe_stern',
        },
        response: 'Du wickelst den Schal von deinem Hals und legst ihn Agathe um die Schultern. Sofort fröstelt es dich. Agathe sagt lange nichts. Dann greift sie in ihre Schürzentasche und legt dir einen kleinen Stern aus geflochtenem Stroh in die Hand. „Den hab ich als Kind gemacht“, flüstert sie. „Er gehört dem, der gibt, ohne zu fragen.“',
      },
      {
        id: 'schal_ohne_stern',
        label: 'Ihr deinen Schal umlegen',
        if: { has: 'schal', flag: 'agathe_beschenkt', notFlag: 'schal_verschenkt' },
        effects: { take: { schal: 1 }, attr: { guete: 2 }, set: ['schal_verschenkt'] },
        response: 'Du wickelst den Schal von deinem Hals und legst ihn Agathe um die Schultern. Sofort fröstelt es dich. „Kind, Kind“, sagt Agathe nur und hält deine Hand fest. „Deine Großmutter wäre stolz auf dich.“',
      },
      { label: 'Zurück auf den Platz', to: 'dorfplatz' },
    ],
  },
];
