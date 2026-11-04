# Umsetzungsplan

Plan für die technische Umsetzung von *Advent-ure: Die vierundzwanzigste Tür* als reines Browser-Spiel ohne Backend. Story: [STORY.md](STORY.md) · Graph: [STATIONSGRAPH.md](STATIONSGRAPH.md)

---

## 1. Ziele und Rahmenbedingungen

| Anforderung | Entscheidung |
|---|---|
| Läuft im Browser | Statische Website aus HTML, CSS und JavaScript |
| Kein Backend | Alle Daten liegen im Client. Hosting ist auf jedem statischen Hoster möglich (z. B. GitHub Pages). |
| Zustand im Browser | **Local Storage** für Spielstand und Erinnerungskalender (siehe Abschnitt 5) |
| Gerichteter Graph | Die Stationen sind **Daten**, keine Logik. Eine generische Engine interpretiert sie. |
| Atmosphäre | Schneefall, warme und frostige Farbstimmungen, Typewriter-Text, optional leiser Ambient-Sound |
| Wartbarkeit | Story-Autor:innen sollen Stationen bearbeiten können, ohne die Engine anzufassen. Ein Validator prüft den Graphen. |

**Nicht-Ziele:** Kein Framework, kein Build-Schritt zwingend, keine Accounts, kein Server, kein Tracking.

---

## 2. Technologie

- **Vanilla JavaScript (ES2022, ES-Module).** Das Projekt ist klein genug, ein Framework brächte nur Ballast. Module halten Engine, Rendering und Daten sauber getrennt.
- **CSS mit Custom Properties** für Themes (Farben, Glühen, Frost), dazu `prefers-reduced-motion` und `prefers-color-scheme`.
- **Canvas 2D** für den Schneefall.
- **Web Audio API** (optional) für Ambient-Sounds wie Wind, Kaminknistern und Glocken. Sound ist standardmäßig aus.
- **Schriften:** eine Serifenschrift mit Buchcharakter (z. B. *EB Garamond* oder *Cormorant Garamond*) für den Text, eine schmale Schrift für die UI. Die Schriften werden lokal in `assets/fonts/` gebündelt, damit das Spiel offline funktioniert.
- **Node.js (nur Entwicklung)** für Validator, Graph-Export und Tests. Mit `node --test` gibt es keine Laufzeitabhängigkeiten.
- **Lokaler Entwicklungsserver:** ES-Module funktionieren nicht über `file://`. Für die Entwicklung reicht `python3 -m http.server` oder `npx serve`.

---

## 3. Projektstruktur

```
advent-ure/
├── index.html                # Einstiegsseite, Grundgerüst der UI
├── css/
│   ├── base.css              # Reset, Typografie, Layout
│   ├── theme.css             # Farb-Tokens, Klima-Stimmungen (warm/mild/kalt/eisig)
│   └── effects.css           # Frostrand, Glühen, Übergänge
├── js/
│   ├── main.js               # Bootstrapping, Menü, Event-Verdrahtung
│   ├── engine/
│   │   ├── engine.js         # Zustandsautomat: Wahl ausführen, globale Regeln
│   │   ├── conditions.js     # Auswertung von Bedingungen
│   │   ├── effects.js        # Anwendung von Effekten
│   │   ├── state.js          # Zustandsobjekt, Initialzustand, Klonen
│   │   └── storage.js        # Local-Storage-Zugriff, Versionierung, Migration
│   ├── ui/
│   │   ├── renderer.js       # Station, Wahlen, Uhr, Wärme, Inventar rendern
│   │   ├── typewriter.js     # Textanimation (überspringbar)
│   │   ├── menu.js           # Hauptmenü, Erinnerungskalender, Optionen
│   │   └── a11y.js           # Fokus-Management, Tastatursteuerung
│   └── fx/
│       ├── snow.js           # Schneefall-Canvas
│       └── audio.js          # Ambient-Sound (optional)
├── data/
│   ├── stations/
│   │   ├── a-ankunft.js
│   │   ├── b-omas-haus.js
│   │   ├── c-dorfplatz.js
│   │   ├── d-kirche.js
│   │   ├── e-muehle.js
│   │   ├── f-wald.js
│   │   ├── g-turm.js
│   │   └── x-enden.js
│   ├── items.js              # Gegenstandsdefinitionen
│   ├── memories.js           # 24 Erinnerungen (Meta-Kalender)
│   ├── config.js             # Startwerte, Klimaregeln, Uhrzeit-Texte
│   └── index.js              # Fügt alle Stationen zu einem Graphen zusammen
├── tools/
│   ├── validate-graph.mjs    # Prüfregeln aus STATIONSGRAPH.md §8
│   ├── export-mermaid.mjs    # Erzeugt das Mermaid-Diagramm aus den Daten
│   └── simulate.mjs          # Zustandsraumsuche für Balancing (Zeit/Wärme)
├── tests/
│   ├── conditions.test.mjs
│   ├── effects.test.mjs
│   ├── engine.test.mjs
│   └── storage.test.mjs
├── assets/
│   ├── fonts/
│   ├── audio/                # kurze, loopbare OGG/MP3, lizenzfrei
│   └── img/                  # optional: Vignetten, Favicon
└── docs/
    ├── STORY.md
    ├── STATIONSGRAPH.md
    └── UMSETZUNGSPLAN.md
```

Die Stationsdaten liegen als **JS-Module** vor, nicht als JSON. So sind Kommentare möglich, mehrzeilige Texte lassen sich mit Template-Literals schreiben, und es gibt kein `fetch`. Die Daten bleiben trotzdem reine Objekte ohne Funktionen und sind damit auch per Node validierbar.

---

## 4. Datenmodell

### 4.1 Station (Schema)

Beschreibung der Felder. Die genaue Syntax wird in M1 festgelegt.

| Feld | Typ | Pflicht | Beschreibung |
|---|---|---|---|
| `id` | string | ja | Eindeutige ID, z. B. `"stube"` |
| `title` | string | ja | Überschrift der Station |
| `area` | string | ja | Bereich (`ankunft`, `haus`, `dorf`, `kirche`, `muehle`, `wald`, `turm`, `ende`) für Theme und Sound |
| `climate` | `"warm" \| "mild" \| "kalt" \| "eisig"` | ja | Für die Kälteregel und die visuelle Stimmung |
| `text` | Liste von Absätzen | ja | Jeder Absatz ist entweder ein String oder ein Objekt `{ when: Bedingung, text }` |
| `choices` | Liste von Wahlen | ja (leer bei Enden) | siehe 4.2 |
| `ending` | Objekt | nur Enden | `{ number, title, memory }` |
| `sound` | string | optional | Ambient-Loop überschreiben (sonst aus Bereich/Klima abgeleitet) |
| `onEnter` | Effekte | optional | Effekte, die beim Betreten ausgeführt werden (z. B. Erinnerung freischalten) |

### 4.2 Wahl (Schema)

| Feld | Typ | Beschreibung |
|---|---|---|
| `label` | string | Text der Wahl |
| `to` | string | Ziel-ID. Fehlt es, ist die Wahl eine Aktion ↺. |
| `minutes` | number | Zeitkosten, Standard 0 |
| `if` | Bedingung | Optional. Wenn nicht erfüllt, wird die Wahl ausgeblendet. |
| `showLocked` | boolean | Ausgegraut anzeigen statt ausblenden |
| `hint` | string | Hinweis zu einer ausgegrauten Wahl (z. B. „Dafür brauchst du Streichhölzer.“) |
| `once` | boolean | Standard ist `true` bei Aktionen, `false` bei Wegen. Die Engine merkt sich benutzte Aktionen automatisch im Zustand (`used`). |
| `effects` | Effekte | siehe 4.4 |
| `response` | string | Optionaler Text, der nach einer Aktion als kurze Rückmeldung erscheint (z. B. „Der Tee schmeckt nach Thymian und Honig.“) |
| `sfx` | string | Optionaler Soundeffekt (z. B. `spieldose`, `eis`) |
| `id` | string | Optional. Stabiler Schlüssel für einmalige Aktionen, Standard ist das Label. |

### 4.3 Bedingungen

Bedingungen sind deklarative Objekte und kein ausführbarer Code. Damit sind sie im Validator statisch analysierbar.

| Operator | Bedeutung |
|---|---|
| `has: "item"` | Gegenstand vorhanden (Anzahl ≥ 1) |
| `hasNot: "item"` | Gegenstand nicht vorhanden |
| `flag: "name"` | Flag gesetzt |
| `notFlag: "name"` | Flag nicht gesetzt |
| `attr: { guete: { gte: 2 } }` | Attributvergleich (`gte`, `lte`, `gt`, `lt`, `eq`) |
| `all: [ … ]` | UND |
| `any: [ … ]` | ODER |
| `not: { … }` | Negation |
| `ref: "kennt_legende"` | Benannte, wiederverwendbare Bedingung aus `config.js` |
| `first: true` | Erster Besuch der aktuellen Station (Aktionen zählen nicht als Besuch) |
| `visited: "stube"` | Station wurde schon besucht |

### 4.4 Gegenstände

`data/items.js` bildet IDs auf `{ name, icon, description, use? }` ab. `use` ist `{ label, effects, response }` und erscheint als Knopf im Inventar (z. B. „Essen“).

### 4.5 Effekte

| Effekt | Bedeutung |
|---|---|
| `give: { item: anzahl }` | Gegenstände hinzufügen |
| `take: { item: anzahl }` | Gegenstände entfernen |
| `set: ["flag", …]` | Flags setzen |
| `unset: ["flag", …]` | Flags löschen |
| `attr: { waerme: +2, guete: -1 }` | Attribute ändern, mit Clamping laut `config.js` |
| `memory: "id"` | Erinnerung im Meta-Kalender freischalten |

### 4.6 Spielzustand

```
{
  version: 1,
  station: "stube",
  attrs:  { zeit: 35, waerme: 8, guete: 1 },
  items:  { laterne: 1, lebkuchen: 2, ... },
  flags:  { brief_gelesen: true, ... },
  used:   { "kueche#lebkuchen": true, ... },   // benutzte einmalige Aktionen
  visits: { bahnhof: 1, stube: 2, ... },        // Besuchszähler (für `first`/`visited`)
  log:    [ "bahnhof", "waerterhaus", ... ],   // besuchte Stationen (für Statistik/Epilog)
  startedAt: "2026-12-24T21:00:00.000Z"
}
```

Der Zustand ist **serialisierbar und unveränderlich**. Jede Wahl erzeugt einen neuen Zustand. Das vereinfacht Tests, Autosave und den Simulator.

---

## 5. Speicherung im Browser

| Schlüssel | Speicher | Inhalt | Lebensdauer |
|---|---|---|---|
| `adventure:save:v1` | localStorage | aktueller Spielstand (Autosave nach jeder Wahl) | bis zum Neustart oder Löschen |
| `adventure:memories:v1` | localStorage | IDs der freigeschalteten Erinnerungen und gesehenen Enden | dauerhaft, über alle Durchgänge |
| `adventure:settings:v1` | localStorage | Sound an/aus, Textgeschwindigkeit, reduzierte Effekte | dauerhaft |

**Begründung für Local Storage statt Session Storage:** Ein Textadventure wird oft unterbrochen. Mit Local Storage kann man den Tab schließen und später „Fortsetzen“ wählen. Für den Erinnerungskalender ist es ohnehin nötig. Session Storage bringt hier keinen Vorteil. Optional kann in den Einstellungen „Spielstand nur für diese Sitzung“ angeboten werden. Dann schreibt `storage.js` den Spielstand in den Session Storage.

**Robustheit:**
- Jeder Zugriff steht in `try/catch`, weil z. B. Private Modes Speicherfehler werfen. Schlägt der Zugriff fehl, läuft das Spiel im Speicher weiter und zeigt einen Hinweis.
- Gespeicherte Daten werden beim Laden validiert: Version und existierende Station werden geprüft, bei Problemen gibt es einen sauberen Neustart.
- Ein Versionsfeld mit Migrationsfunktion hält alte Spielstände nach Content-Updates nutzbar. Fehlt eine Station, wird auf `stube` zurückgefallen.
- Unter „Optionen → Alles zurücksetzen“ werden alle drei Schlüssel gelöscht.

**Kein Zurück-Button im Spiel:** Entscheidungen sollen Gewicht haben. Ein Neustart ist jederzeit möglich.

---

## 6. Engine-Ablauf

```
choose(state, choiceIndex):
  1. Wahl auflösen, Bedingung erneut prüfen (Schutz gegen veraltete UI)
  2. Effekte anwenden, Aktion als benutzt markieren, zeit += minutes
  3. Kälteregel (nur bei minutes > 0 und Ziel kalt/eisig; Schal/Lichtfunke mindern)
  4. Ziel ist ein Ende?              → Ende setzen, Erinnerung freischalten, fertig
  5. waerme <= 0?                    → ende_schneeschlaf
  6. zeit >= 180 && !laterne_brennt  → ende_zu_spaet
  7. Viertelstunden-Glockenschlag ermitteln (Hinweistext für die UI)
  8. onEnter-Effekte der Zielstation
  9. neuen Zustand zurückgeben + Ereignisliste (für UI-Feedback: „+ Lebkuchen“, „Wärme −1“, Glockenschlag)
```

Die Engine ist **frei von DOM-Zugriffen**. Sie läuft identisch im Browser, in Tests und im Simulator.

`availableChoices(state)` liefert die anzuzeigenden Wahlen inklusive `locked`-Status und Hinweistext. `renderText(state)` liefert die Absätze der Station, gefiltert nach ihren Bedingungen.

---

## 7. Benutzeroberfläche und Atmosphäre

### 7.1 Layout

```
┌────────────────────────────────────────────┐
│  🕯 22:45        ❄❄❄❄❄❄○○○○ Wärme    ☰   │  ← Statusleiste
├────────────────────────────────────────────┤
│                                            │
│   OMAS KÜCHE                               │  ← Titel
│                                            │
│   Es riecht nach Zimt und Nelken …         │  ← Text (Typewriter)
│                                            │
│   ─────────────                            │
│   1  Die Streichhölzer vom Sims nehmen     │  ← Wahlen
│   2  Lebkuchen aus der blauen Dose nehmen  │
│   3  Zurück in die Stube                   │
│                                            │
├────────────────────────────────────────────┤
│  Manteltaschen: 🏮 Laterne · 🍪 ×2 · 🧣    │  ← Inventar (aufklappbar)
└────────────────────────────────────────────┘
```

- **Uhr** als Kirchturmuhr-Symbol mit Uhrzeit. Ab 23:30 pulsiert sie dezent.
- **Wärme** als Reihe aus 10 Symbolen (Flammen oder Schneeflocken), dazu ein Text („behaglich“, „frierend“, „eiskalt“).
- **Güte** wird nicht angezeigt.
- **Inventar** öffnet sich per Klick. Verbrauchbare Gegenstände haben dort den Knopf „Essen“.

### 7.2 Stimmung pro Klima

| Klima | Farbwelt | Effekte |
|---|---|---|
| `warm` | Bernstein, Kerzengelb, Dunkelrot | weiches Vignetten-Glühen, kaum Schnee (nur durchs Fenster) |
| `mild` | Holzbraun, gedämpftes Gold | ruhige Darstellung |
| `kalt` | Nachtblau, Silber | normaler Schneefall |
| `eisig` | Eisblau, Weiß, Violett | dichter Schnee, Frost-Rand am Bildschirm |

Zusätzlich hängt der **Frost-Rand** an der Wärme: Je niedriger sie ist, desto weiter wachsen Eiskristalle per CSS-Maske vom Rand herein.

### 7.3 Effekte

- **Schneefall:** Canvas mit 50 bis 300 Flocken, Dichte nach Klima. Parallaxe in 3 Ebenen, leichter Wind. Pausiert bei `document.hidden`.
- **Typewriter:** Text erscheint zeichenweise. Ein Klick, Leertaste oder Enter zeigt sofort alles. Die Geschwindigkeit ist einstellbar, „sofort“ eingeschlossen.
- **Übergänge:** kurze Überblendung zwischen Stationen (300 ms), bei Enden langsamer mit Weißblende.
- **Glockenschlag:** Eine Textzeile blendet ein, optional mit Glockenton.
- **Gegenstand erhalten:** eine kleine Einblendung „+ Sturmlaterne“, die zur Inventarleiste fliegt.
- **Finale:** Beim Entzünden der Laterne läuft ein Lichtausbruch von der Bildschirmmitte aus. Der Schnee wird golden.

### 7.4 Sound (optional, standardmäßig aus)

- Loops je Bereich: Wind (draußen), Kaminknistern (warm), Mühlrad-Knarzen, Kirchenhall.
- Einzelsounds: Glockenschlag, Spieldose, Eisknacken, Tür.
- Lautstärke-Crossfade beim Bereichswechsel über Web Audio `GainNode`.
- Nur lizenzfreie Quellen (CC0), dokumentiert in `assets/audio/CREDITS.md`.

### 7.5 Barrierefreiheit

- Semantisches HTML: `<main>`, `<h1>`, die Wahlen als `<button>` in einer `<ol>`.
- `aria-live="polite"` für neuen Stationstext und Ereignisse. Während der Typewriter läuft, bekommen Screenreader sofort den vollständigen Text.
- Tastatur: Ziffern 1–9 wählen, `I` öffnet das Inventar, `M` das Menü, `Esc` schließt.
- Nach jedem Stationswechsel liegt der Fokus auf der Überschrift.
- `prefers-reduced-motion`: kein Typewriter, statischer Schnee bzw. keiner, keine Blenden.
- Kontrast nach WCAG AA in allen Klimastufen.
- Responsiv vom Smartphone (≥ 320 px) bis Desktop. Die Lesebreite ist auf etwa 65 Zeichen begrenzt.

### 7.6 Menüs

- **Hauptmenü:** Neues Spiel · Fortsetzen (nur mit Spielstand) · Erinnerungskalender · Optionen · Über.
- **Erinnerungskalender:** ein Raster mit 24 Türen. Geöffnete Türen zeigen Titel und ein kleines Symbol, geschlossene nur ihre Nummer. Gefundene Enden sind besonders hervorgehoben.
- **Optionen:** Textgeschwindigkeit, Sound, reduzierte Effekte, Spielstand nur für diese Sitzung, alles zurücksetzen.

---

## 8. Werkzeuge und Qualitätssicherung

### 8.1 Graph-Validator (`tools/validate-graph.mjs`)

Er setzt die Prüfregeln aus STATIONSGRAPH.md §8 um:
- Ziel-IDs existieren, es gibt keine verwaisten Stationen und keine doppelten IDs.
- Gegenstände und Flags werden konsistent verwendet: Alles, was abgefragt wird, wird irgendwo gesetzt, und alles, was gesetzt wird, wird irgendwo gelesen (sonst Warnung).
- Jede Nicht-End-Station hat mindestens eine Wahl ohne Bedingung.
- Erreichbarkeit aller Stationen und Enden.
- Ausgabe in der Konsole mit Exit-Code ≠ 0 bei Fehlern, damit er in CI nutzbar ist.

### 8.2 Simulator (`tools/simulate.mjs`)

- Eine Breitensuche über den echten Engine-Code. Der Zustand wird dabei abstrahiert: Station, Gegenstände, Flags, Zeit in 5-Minuten-Schritten, Wärme, Güte.
- Ergebnisse:
  - kürzester Weg (Zeit) zu jedem Ende,
  - minimale und maximale Restwärme auf diesen Wegen,
  - ob das beste Ende aus „frühen“ Zuständen noch erreichbar ist (Softlock-Erkennung),
  - eine Liste der Stationen und Aktionen, die in keinem gültigen Lauf vor Mitternacht erreichbar sind.
- Damit werden die Startwerte in `config.js` (Wärme, Minuten, Kälteverlust) begründet eingestellt.

### 8.3 Tests (`node --test`)

- **Bedingungen:** alle Operatoren, Verschachtelung, benannte Referenzen.
- **Effekte:** Clamping, Mengen, Aktionen als `used`.
- **Engine:** Kälteregel mit und ohne Schal oder Lichtfunke, Mitternacht, Schneeschlaf, Reihenfolge der Regeln (ein Ende hat Vorrang), Glockenschlag-Ereignisse.
- **Storage:** Speichern und Laden, defekte Daten, Versionsmigration, nicht verfügbarer Speicher (gemockt).
- **Golden Path:** ein festgelegter Wahlpfad aus STATIONSGRAPH.md §7 muss in `ende_heilige_nacht` enden.

### 8.4 Manuelle Playtests

- Checkliste mit allen 7 Enden und allen 24 Erinnerungen.
- Testgeräte: Desktop-Chrome/Firefox/Safari, iOS Safari, Android Chrome.
- Tests mit Screenreader (VoiceOver) und reiner Tastatur.
- 2–3 externe Testspieler:innen ohne Vorwissen. Beobachtet wird, wo sie hängen bleiben, ob die Zeit reicht und ob die Hinweise verständlich sind.

---

## 9. Meilensteine

| # | Meilenstein | Inhalt | Ergebnis / Abnahme |
|---|---|---|---|
| **M0** | Projektgerüst | Ordnerstruktur, `index.html`, Basis-CSS, `package.json` nur für Skripte (`test`, `validate`, `simulate`, `serve`), `.editorconfig`, README mit Startanleitung | Leere Seite läuft lokal |
| **M1** | Engine-Kern | `state`, `conditions`, `effects`, `engine`, `storage` plus Unit-Tests. Schema endgültig festlegen. | Alle Engine-Tests grün |
| **M2** | Vertikaler Schnitt | Bereich A + B (Ankunft, Omas Haus) als Daten, minimales Rendering (Text, Wahlen, Status, Inventar) | Man kann vom Bahnhof bis zum Kalender spielen, Autosave funktioniert |
| **M3** | Validator & Mermaid-Export | `validate-graph.mjs`, `export-mermaid.mjs` | Validator läuft fehlerfrei über A + B |
| **M4** | Restlicher Content | Bereiche C–G und alle Enden mit vollständigen Texten nach den Stilrichtlinien, Epilog-Varianten | Validator grün, alle Enden manuell erreichbar |
| **M5** | Atmosphäre | Klima-Themes, Schneefall, Frost-Rand, Typewriter, Übergänge, Glockenschlag, Finale-Effekt | Subjektiv „weihnachtlich und stimmungsvoll“, 60 fps auf Mittelklasse-Smartphone |
| **M6** | Menüs & Meta | Hauptmenü, Fortsetzen, Optionen, Erinnerungskalender mit 24 Türen | Erinnerungen bleiben nach Reload erhalten |
| **M7** | Balancing | Simulator, Werte in `config.js` justieren, Hinweise in Texten nachschärfen | Bestes Ende mit ≥ 30 min Puffer auf dem Golden Path erreichbar, vollständige Erkundung in einem Lauf **nicht** möglich, kein Softlock |
| **M8** | Sound (optional) | Audio-Loops, Einzelsounds, Crossfades, Credits | Sound standardmäßig aus, sauber stummschaltbar |
| **M9** | Feinschliff & Release | Barrierefreiheit, Responsiveness, Browser-Tests, Favicon, Meta-Tags, Deployment auf GitHub Pages | Lighthouse: Accessibility ≥ 95, Performance ≥ 90 |

Empfohlene Reihenfolge: M0 → M1 → M2 → M3 → M4 → M5 → M6 → M7 → M9, mit M8 parallel oder zum Schluss. Der **vertikale Schnitt (M2)** ist bewusst früh angesetzt, um Schema und UI an echtem Content zu prüfen, bevor alle 45 Stationen geschrieben sind.

---

## 10. Risiken und Gegenmaßnahmen

| Risiko | Gegenmaßnahme |
|---|---|
| Der Graph wird inkonsistent (tote Links, unerreichbare Gegenstände) | Validator und Simulator laufen bei jedem Content-Änderungsschritt mit, optional als Git-Hook oder CI |
| Zeit- und Wärmewerte sind frustrierend oder zu leicht | Werte zentral in `config.js` pflegen, mit dem Simulator prüfen und in Playtests nachjustieren |
| Spieler:innen verstehen die Runenrätsel nicht | Omas Brief nennt die drei Prinzipien. Ausgegraute Wahlen mit Hinweis und Text-Varianten am Kalender geben Tipps. Agathe und Anselm geben bei Bedarf Hinweise. |
| Speicher im Browser nicht verfügbar | Fallback auf In-Memory-Zustand mit Hinweis, Engine unabhängig von Storage |
| Textmenge (45 Stationen plus Varianten) | Texte nach Bereichen in eigenen Dateien schreiben und Bereich für Bereich mit Playtest abnehmen |
| ES-Module über `file://` funktionieren nicht | Startanleitung mit lokalem Server im README. Optional später ein Single-File-Build (`tools/bundle.mjs`), der alles in eine `index.html` inlined. |

---

## 11. Definition of Done (Release 1.0)

- [ ] Alle 38 Spielstationen und 7 Enden sind mit finalen Texten umgesetzt.
- [ ] Validator und Simulator laufen ohne Fehler, alle Tests sind grün.
- [ ] Der Golden Path zum besten Ende ist automatisiert getestet.
- [ ] Alle 24 Erinnerungen sind freischaltbar und bleiben über Reloads erhalten.
- [ ] Autosave und Fortsetzen funktionieren, und „Alles zurücksetzen“ löscht wirklich alles.
- [ ] Das Spiel ist mit Tastatur und Screenreader spielbar, und `prefers-reduced-motion` wird respektiert.
- [ ] Es läuft offline nach dem ersten Laden, ohne externe Requests (Schriften lokal).
- [ ] Es ist auf GitHub Pages veröffentlicht, und das README enthält Link und Startanleitung.
