# advent-ure
Ein weihnachtliches Textadventure

**Die vierundzwanzigste Tür:** Am Heiligabend ist Oma verschwunden, und die Sternlaterne auf dem Kirchturm von Tannbrück ist dunkel. Bis Mitternacht bleiben drei Stunden.

Das Spiel läuft komplett im Browser, ohne Backend. Der Spielstand liegt im Local Storage.

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

Danach im Browser <http://localhost:8080> öffnen.

## Entwicklung

Es gibt keine Laufzeitabhängigkeiten. Node.js (≥ 20) wird nur für die Werkzeuge gebraucht:

| Befehl | Zweck |
|---|---|
| `npm test` | Unit-Tests (`node --test`) |
| `npm run validate` | Prüft den Stationsgraphen auf Konsistenz |
| `npm run simulate` | Zustandsraumsuche für Balancing (Zeit und Wärme) |
| `npm run graph` | Erzeugt ein Mermaid-Diagramm aus den Spieldaten |
| `npm run check` | Validator und Tests zusammen |
