// Definierte Spielrouten für Balancing (Simulator) und Tests.
// Jede Route ist eine Folge von Wahl-Labels; „essen:<id>“ benutzt einen Gegenstand.

/** Gemeinsamer Anfang: Bahnhof, Wärterhaus, Omas Haus komplett. */
const ANKUNFT_UND_HAUS = [
  'An die Tür des Wärterhäuschens klopfen',
  'Einen Becher Tee annehmen', 'Um die Sturmlaterne bitten', 'Hinaus und hinunter ins Dorf',
  'Zu Omas Haus am Dorfrand', 'Eintreten',
  'Den Brief lesen', 'Den Brief einstecken',
  'In die Küche', 'Die Streichhölzer vom Sims nehmen', 'Die blaue Dose öffnen', 'Die Zimtsterne einpacken', 'Zurück in die Stube',
  'Den Kachelofen anheizen',
  'Die Stiege zum Dachboden hinauf', 'Die alte Truhe öffnen', 'Den Wollschal umlegen', 'Die Spieldose mitnehmen', 'Die Truhe schließen',
  'Dem Rascheln nachgehen', 'Ihm einen Lebkuchen schenken', 'Hinunter in die Stube',
  'In die Küche', 'Milch auf dem Herd wärmen und trinken', 'Zurück in die Stube', 'Hinaus vor das Haus',
];

/** Vom Kalender bis in die Glockenstube. */
const KALENDER_BIS_TURM = [
  'Den Adventskalender betrachten',
];

const FUNKE_BIS_TURM = [
  'Die vierundzwanzigste Tür öffnen',
  'Den Funken in die Laterne setzen und zur Kirche eilen',
  'Die Kirche betreten', 'Den Küster ansprechen', 'Ihm den Lichtfunken zeigen', 'Zurück ins Kirchenschiff',
  'Hinaus auf den Vorplatz', 'Die Turmtür aufschließen', 'Mit dem Lichtfunken hinaufsteigen',
];

/** Schnellster sinnvoller Weg ohne Wald (siehe STATIONSGRAPH.md §7). */
export const GOLDEN_PATH_TO_TOWER = [
  ...ANKUNFT_UND_HAUS,
  'Zum Dorfplatz', 'Zur Maronenfrau gehen',
  'Nach dem Schneeweber fragen', 'Ihren Maronenofen anzünden', 'Ihr einen Lebkuchen schenken', 'Zurück auf den Platz',
  'Den Bachweg zur alten Mühle', 'Dem Weg zur Mühle folgen', 'Durch die knarrende Tür hinein',
  'Zum Wichtelrat gehen', 'Um Reparatur der Spieldose bitten', 'Dich verabschieden',
  'Das Mahlwerk untersuchen', 'Pimpernell durch die Falltür folgen', 'Durch die Klappe hinter dem Altar steigen',
  'Den Küster ansprechen', 'Ihm Omas Brief zeigen', 'Zurück ins Kirchenschiff',
  'Eine Flamme vom Ewigen Licht nehmen', 'Hinaus auf den Vorplatz', 'Zurück zum Dorfplatz',
  'Zu Omas Haus', 'Eintreten',
  ...KALENDER_BIS_TURM,
  'Die Flammenrune mit der Flamme des Ewigen Lichts tauen', 'Die Spieldose am Siegel spielen',
  'Den Strohstern auf die Herzrune legen',
  ...FUNKE_BIS_TURM,
];

export const GOLDEN_PATH = [
  ...GOLDEN_PATH_TO_TOWER,
  'Mit dem Schneeweber sprechen', 'Omas Spieldose für ihn spielen', 'Gemeinsam die Sternlaterne entzünden',
];

/**
 * Über den Wald: Köhlerglut statt Kirchenflamme, Begegnung am Webstuhl, den
 * Bach hinab zur Mühle, Mühlrad befreien, Silberglöckchen statt Spieldose.
 */
export const WALD_PATH = [
  ...ANKUNFT_UND_HAUS,
  'Zum Dorfplatz', 'Zur Maronenfrau gehen', 'Ihr einen Lebkuchen schenken', 'Zurück auf den Platz',
  'Hinaus zum Waldrand',
  'Mit der Laterne dem Rauchgeruch folgen', 'Dich am Feuer aufwärmen', 'Um Glut aus dem Meiler bitten', 'Zurück zum Waldrand',
  'Zum glitzernden Eissee', 'Omas Korb untersuchen', 'Über das Eis zum Webstuhl gehen',
  'Ihn fragen, warum er das tut', 'Schweigend nicken', 'Zurück ans Ufer',
  'Dem Bachlauf hinab zur Mühle', 'Durch die knarrende Tür hinein',
  'Zum Wichtelrat gehen', 'Das Mühlrad mit deiner Flamme befreien', 'Dich verabschieden',
  'Das Mahlwerk untersuchen', 'Pimpernell durch die Falltür folgen', 'Durch die Klappe hinter dem Altar steigen',
  'Hinaus auf den Vorplatz', 'Zurück zum Dorfplatz',
  'Zu Omas Haus', 'Eintreten',
  ...KALENDER_BIS_TURM,
  'Die Flammenrune mit der Köhlerglut tauen', 'Das Silberglöckchen läuten',
  'Den Strohstern auf die Herzrune legen',
  ...FUNKE_BIS_TURM,
  'Mit dem Schneeweber sprechen', 'Ihm deinen Schal umlegen', 'Gemeinsam die Sternlaterne entzünden',
];

/** Versuch, in einem Durchgang wirklich alles zu sehen – soll scheitern. */
export const KOMPLETT_PATH = [
  ...ANKUNFT_UND_HAUS,
  'Zum Dorfplatz', 'Zur Maronenfrau gehen',
  'Nach dem Schneeweber fragen', 'Ihren Maronenofen anzünden', 'Ihr einen Lebkuchen schenken', 'Zurück auf den Platz',
  'Die Gasse hinauf zur Kirche', 'Die Kirche betreten', 'Die Krippe betrachten', 'Zurück ins Kirchenschiff',
  'Den Küster ansprechen', 'Fragen, was ihn bedrückt', 'Ihm Omas Brief zeigen', 'Zurück ins Kirchenschiff',
  'Eine Flamme vom Ewigen Licht nehmen', 'Hinaus auf den Vorplatz', 'Zurück zum Dorfplatz',
  'Hinaus zum Waldrand',
  'Dem Wimmern nachgehen', 'Die Schlinge vorsichtig lösen', 'Ihm einen Lebkuchen hinlegen', 'Zurück zum Waldrand',
  'Mit der Laterne dem Rauchgeruch folgen', 'Dich am Feuer aufwärmen', 'Nach dem Schneeweber fragen',
  'Ihm beim Holzhacken helfen', 'Die Axt zurückgeben', 'Um Glut aus dem Meiler bitten', 'Zurück zum Waldrand',
  'Zum glitzernden Eissee', 'Omas Korb untersuchen', 'Über das Eis zum Webstuhl gehen',
  'Ihn fragen, warum er das tut', 'Schweigend nicken', 'Zurück ans Ufer', 'Zurück zum Waldrand',
  'Zurück zum Dorfplatz',
  'Den Bachweg zur alten Mühle', 'Über das Eis abkürzen', 'Dich triefend ans Ufer retten',
  'Durch das Fensterchen spähen', 'Dich vom Fenster lösen', 'Durch die knarrende Tür hinein',
  'Zimtsterne auf den Mühlstein legen', 'Zum Wichtelrat gehen', 'Um Reparatur der Spieldose bitten',
  'Das Mühlrad mit deiner Flamme befreien', 'Dich verabschieden',
  'Das Mahlwerk untersuchen', 'Pimpernell durch die Falltür folgen', 'Durch die Klappe hinter dem Altar steigen',
  'Hinaus auf den Vorplatz', 'Zurück zum Dorfplatz', 'Zu Omas Haus', 'Eintreten',
  ...KALENDER_BIS_TURM,
  'Die Flammenrune mit der Köhlerglut tauen', 'Die Spieldose am Siegel spielen',
  'Den Strohstern auf die Herzrune legen',
  ...FUNKE_BIS_TURM,
];

/** Wie der Golden Path, aber der Schal bleibt in der Truhe (Wärme-Grenzfall). */
export const OHNE_SCHAL_PATH = GOLDEN_PATH.filter((step) => step !== 'Den Wollschal umlegen');

/**
 * Softlock-Probe: Schal an Agathe, alle Lebkuchen weg – die Spieldose muss als
 * Gabe im Finale genügen.
 */
export const ALLES_VERSCHENKT_PATH = (() => {
  const steps = GOLDEN_PATH.map((step) => (step === 'Ihr einen Lebkuchen schenken' ? 'Ihr deinen Schal umlegen' : step));
  const at = steps.indexOf('Zurück auf den Platz');
  steps.splice(at, 0, 'essen:lebkuchen', 'essen:lebkuchen');
  return steps;
})();

/**
 * Softlock-Probe: Pimpernell verscheucht (kein Geheimgang, Güte −1). Zugang
 * zum Wichtelrat über die Zimtsterne, Güte über Agathe, Wichtel und Mühlrad.
 */
export const VERSCHEUCHT_PATH = [
  ...ANKUNFT_UND_HAUS.map((step) => (step === 'Ihm einen Lebkuchen schenken' ? '„Husch, verschwinde!“' : step)),
  'Zum Dorfplatz', 'Zur Maronenfrau gehen',
  'Nach dem Schneeweber fragen', 'Ihren Maronenofen anzünden', 'Ihr einen Lebkuchen schenken', 'Zurück auf den Platz',
  'Die Gasse hinauf zur Kirche', 'Die Kirche betreten', 'Den Küster ansprechen', 'Ihm Omas Brief zeigen',
  'Zurück ins Kirchenschiff', 'Eine Flamme vom Ewigen Licht nehmen', 'Hinaus auf den Vorplatz', 'Zurück zum Dorfplatz',
  'Den Bachweg zur alten Mühle', 'Dem Weg zur Mühle folgen', 'Durch die knarrende Tür hinein',
  'Zimtsterne auf den Mühlstein legen', 'Zum Wichtelrat gehen', 'Um Reparatur der Spieldose bitten',
  'Das Mühlrad mit deiner Flamme befreien', 'Dich verabschieden', 'Hinaus', 'Zurück zum Bach', 'Zurück zum Dorfplatz',
  'Zu Omas Haus', 'Eintreten',
  ...KALENDER_BIS_TURM,
  'Die Flammenrune mit der Flamme des Ewigen Lichts tauen', 'Die Spieldose am Siegel spielen',
  'Den Strohstern auf die Herzrune legen',
  ...FUNKE_BIS_TURM,
  'Mit dem Schneeweber sprechen', 'Ihm deinen Schal umlegen', 'Gemeinsam die Sternlaterne entzünden',
];

export const ROUTES = {
  golden: { steps: GOLDEN_PATH, expect: 'ende_heilige_nacht', minBuffer: 30, minWarmth: 2 },
  ohneSchal: { steps: OHNE_SCHAL_PATH, expect: 'ende_heilige_nacht', minBuffer: 30, minWarmth: 1 },
  wald: { steps: WALD_PATH, expect: 'ende_heilige_nacht', minBuffer: 10, minWarmth: 2 },
  verschenkt: { steps: ALLES_VERSCHENKT_PATH, expect: 'ende_heilige_nacht', minBuffer: 30, minWarmth: 1 },
  verscheucht: { steps: VERSCHEUCHT_PATH, expect: 'ende_heilige_nacht', minBuffer: 0, minWarmth: 1 },
  komplett: { steps: KOMPLETT_PATH, expectFailure: true },
};
