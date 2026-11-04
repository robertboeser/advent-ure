# advent-ure
Ein weihnachtliches Textadventure

**Die vierundzwanzigste Tür:** Am Heiligabend ist Oma verschwunden, und die Sternlaterne auf dem Kirchturm von Tannbrück ist dunkel. Bis Mitternacht bleiben drei Stunden.

Das Spiel läuft komplett im Browser, ohne Backend und ohne externe Requests. Spielstand, Erinnerungen und Einstellungen liegen im Local Storage. Nach dem ersten Laden ist es auch offline spielbar.

- 38 Stationen und 7 Enden in einem gerichteten Graphen, Zeit- und Wärmesystem, Manteltaschen-Inventar
- Erinnerungs-Adventskalender mit 24 Türen, der über alle Durchgänge erhalten bleibt
- Schneefall, Frost und Farbstimmungen je Ort, Typewriter-Text, optional prozedural erzeugte Klänge
- Bedienbar mit Tastatur (1–9, Leertaste, I, M) und Screenreader, respektiert „Bewegung reduzieren“

## Dokumentation

- [Story](docs/STORY.md): Welt, Figuren, Handlung, Enden, Stilrichtlinien
- [Stationsgraph](docs/STATIONSGRAPH.md): alle Stationen, Wahlen, Bedingungen, Gegenstände und Regeln
- [Stationsgraph (generiert)](docs/STATIONSGRAPH-GENERIERT.md): Diagramm aus den tatsächlichen Spieldaten
- [Umsetzungsplan](docs/UMSETZUNGSPLAN.md): Architektur, Datenmodell, Speicherung, UI, Meilensteine

## Lokal starten

Das Spiel nutzt ES-Module. Die funktionieren nicht über `file://`, darum braucht man einen kleinen lokalen Webserver:

```sh
npm run serve          # entspricht: python3 -m http.server 8080
```

Danach im Browser <http://localhost:8080> öffnen. Der Service Worker für den Offline-Betrieb ist auf `localhost` abgeschaltet, damit Änderungen sofort sichtbar sind. Mit `?sw` an der URL lässt er sich zum Testen einschalten.

## Entwicklung

Es gibt keine Laufzeitabhängigkeiten. Node.js (≥ 20) wird nur für die Werkzeuge gebraucht:

| Befehl | Zweck |
|---|---|
| `npm test` | Unit-, Durchspiel-, Balancing- und Release-Tests (`node --test`) |
| `npm run validate` | Prüft den Stationsgraphen auf Konsistenz |
| `npm run simulate` | Balancing: Routen gegen Zeit- und Wärmeziele, Zufallsdurchläufe |
| `npm run simulate -- --trace golden` | Eine Route Schritt für Schritt mit Uhrzeit und Wärme |
| `npm run graph -- --write` | Erzeugt `docs/STATIONSGRAPH-GENERIERT.md` aus den Spieldaten |
| `npm run check` | Validator und Tests zusammen |

Inhalte stehen ausschließlich in `data/`, Balancing-Werte in `data/config.js`. Nach einer Änderung an Laufzeitdateien bitte die Version in `package.json` und `sw.js` erhöhen. Ein Test prüft, dass beide übereinstimmen und dass `sw.js` alle Dateien listet.

## Veröffentlichen

`.github/workflows/pages.yml` prüft und veröffentlicht das Spiel bei jedem Push auf `main` auf GitHub Pages. Dafür muss in den Repository-Einstellungen unter *Pages* die Quelle „GitHub Actions“ gewählt sein. `.github/workflows/ci.yml` führt Validator, Tests und Simulator bei jedem Push aus.

## Lizenzen

Die Schriften EB Garamond und Cormorant SC stehen unter der SIL Open Font License 1.1, siehe `assets/fonts/`.
