// Bereich G – Glockenturm (Finale)

export const stations = [
  {
    id: 'turmtreppe',
    title: 'Die Turmtreppe',
    area: 'turm',
    climate: 'kalt',
    text: [
      'Der Schlüssel knirscht im Schloss. Hinter der Tür windet sich eine steinerne Wendeltreppe in die Dunkelheit hinauf. Die Stufen sind ausgetreten von Jahrhunderten, und von oben fällt eisige Luft herab.',
      {
        if: { has: 'lichtfunke' },
        text: 'Im Licht des Funkens glitzern die Wände. Das Eis wächst hier von oben nach unten, in langen Zapfen und gewebten Bahnen. Je höher du blickst, desto dichter wird es.',
      },
    ],
    choices: [
      {
        label: 'Mit dem Lichtfunken hinaufsteigen',
        to: 'glockenstube',
        minutes: 10,
        if: { has: 'lichtfunke' },
        showLocked: true,
        hint: 'Ohne den Lichtfunken hat es keinen Sinn, dort hinaufzusteigen.',
      },
      { label: 'Umkehren', to: 'kirche_vorplatz' },
    ],
  },

  {
    id: 'glockenstube',
    title: 'In der Glockenstube',
    area: 'turm',
    climate: 'eisig',
    text: [
      'Dreihundert Stufen. Deine Beine brennen, und dein Atem gefriert, kaum dass er deine Lippen verlässt. Dann stehst du in der Glockenstube.',
      'Die große Glocke hängt still in ihrem Gebälk, eingeschlossen in einen Panzer aus Eis. Durch die Schallöffnungen siehst du das ganze Tal: die Dächer von Tannbrück, den dunklen Wald, den Eissee. Über eine schmale Leiter geht es hinauf in die Laternenkammer. Dort wartet die Sternlaterne. Ihr Glas ist dunkel.',
      'Neben der Leiter steht der Schneeweber. Er ist kleiner als in den Geschichten, oder vielleicht kommt es dir nur so vor. Zu seinen Füßen liegt ein Kokon aus Schnee, fein gewebt, und darin schläft Oma, mit geschlossenen Augen und friedlichem Gesicht.',
      {
        if: { flag: 'schneeweber_gereizt' },
        text: 'Als er deine Laterne sieht, weicht er zurück. „Du schon wieder“, flüstert er. „Mit deinem Feuer.“',
      },
      {
        if: { flag: 'schneeweber_verstanden' },
        text: '„Du bist gekommen“, sagt er leise. „Und du hast ihn mitgebracht.“',
      },
      {
        if: { notFlag: 'schneeweber_getroffen' },
        text: 'Er wendet dir sein Gesicht aus Eis und Mondlicht zu. „Kind der Lichthüterin“, sagt er, und seine Stimme klingt wie Wind in den Tannen. „Gib mir den Funken.“',
      },
      {
        if: { attr: { waerme: { lte: 2 } } },
        text: 'Deine Hände zittern so sehr, dass der Funke in der Laterne flackert.',
      },
    ],
    choices: [
      {
        label: 'Den Lichtfunken in die Sternlaterne setzen',
        to: 'ende_laterne',
        effects: { set: ['laterne_brennt'] },
        sfx: 'glocke',
      },
      {
        label: 'Mit dem Schneeweber sprechen',
        to: 'finale_gespraech',
        if: { ref: 'kennt_legende', attr: { guete: { gte: 2 } } },
      },
      { label: 'Ihm den Lichtfunken geben', to: 'ende_ewiger_winter' },
    ],
  },

  {
    id: 'finale_gespraech',
    title: 'Ein Wort im Frost',
    area: 'turm',
    climate: 'eisig',
    text: [
      'Du stellst die Laterne ab und trittst einen Schritt auf ihn zu. Der Schneeweber rührt sich nicht.',
      '„Ich weiß, wer du bist“, sagst du. „Du webst den Schnee. Jede einzelne Flocke.“',
      'Etwas verändert sich in seinem Gesicht. „Das weißt du?“',
      '„Ich wollte ihn nicht stehlen, den Funken“, sagt er leise. „Ich wollte ihn nur halten. Ein einziges Mal wollte ich wissen, wie sich Wärme anfühlt.“ Er sieht hinunter auf Oma. „Sie hat gesagt, Wärme kann man nicht nehmen. Man kann sie nur geben. Ich habe das nicht verstanden.“',
    ],
    choices: [
      {
        label: 'Ihm deinen Schal umlegen',
        to: 'finale_waerme',
        if: { has: 'schal' },
        effects: { take: { schal: 1 }, set: ['finale_schal'] },
      },
      {
        label: 'Omas Spieldose für ihn spielen',
        to: 'finale_waerme',
        if: { has: 'spieldose' },
        effects: { set: ['finale_spieldose'] },
        sfx: 'spieldose',
      },
      {
        label: 'Ihm einen Lebkuchen anbieten',
        to: 'finale_waerme',
        if: { has: 'lebkuchen' },
        effects: { take: { lebkuchen: 1 }, set: ['finale_lebkuchen'] },
      },
      {
        label: '„Deine Flocken sind das Schönste am Winter.“',
        to: 'finale_waerme',
        if: { attr: { guete: { gte: 4 } } },
        effects: { set: ['finale_worte'] },
      },
      {
        label: 'Doch den Funken in die Laterne setzen',
        to: 'ende_laterne',
        effects: { set: ['laterne_brennt'] },
        sfx: 'glocke',
      },
    ],
  },

  {
    id: 'finale_waerme',
    title: 'Wärme',
    area: 'turm',
    climate: 'mild',
    text: [
      {
        if: { flag: 'finale_schal' },
        text: 'Du wickelst Großvaters Schal von deinem Hals und legst ihn dem Schneeweber um die Schultern. Er muss sich tief zu dir herunterbeugen. Die grüne Wolle sieht seltsam aus auf all dem Eis, und zugleich ganz richtig.',
      },
      {
        if: { flag: 'finale_spieldose' },
        text: 'Du ziehst Omas Spieldose auf. Das Wiegenlied perlt durch die Glockenstube, zart und hell, und das Eis an den Wänden beginnt leise mitzusingen. Der Schneeweber neigt den Kopf und lauscht.',
      },
      {
        if: { flag: 'finale_lebkuchen' },
        text: 'Du hältst ihm einen Lebkuchen hin. Er nimmt ihn mit seinen langen, gläsernen Fingern, ganz vorsichtig, als könnte er zerbrechen, und betrachtet den Mandelstern darauf. „Für mich?“, fragt er. „Einfach so?“',
      },
      {
        if: { flag: 'finale_worte' },
        text: '„Jede einzelne“, sagst du. „Als Kind habe ich stundenlang am Fenster gestanden und versucht, zwei gleiche zu finden. Ich habe nie welche gefunden. Danke.“ Der Schneeweber sieht dich an, als hätte er dieses Wort noch nie gehört.',
      },
      'Dann hält der Schneeweber ganz still. In seiner Brust, dort, wo bei einem Menschen das Herz wäre, glimmt ein winziges Licht auf, golden wie der Funke in deiner Laterne. Er legt die Hand darauf und staunt.',
      '„So fühlt es sich an“, flüstert er.',
      'Der Kokon um Oma rieselt zu Boden wie Puderzucker. Sie blinzelt, setzt sich auf, rückt ihre rote Mütze zurecht und sieht von dir zum Schneeweber und wieder zurück. Dann lächelt sie, als hätte sie genau das erwartet. „Na, komm“, sagt sie und streckt die Hand aus. „Das machen wir zusammen. Alle drei.“',
    ],
    choices: [
      {
        label: 'Gemeinsam die Sternlaterne entzünden',
        to: 'ende_heilige_nacht',
        effects: { set: ['laterne_brennt'] },
        sfx: 'glocke',
      },
    ],
  },
];
