# FBH-Mat – Fußbodenheizung Materialermittlung

Ein browserbasiertes Werkzeug zur Ermittlung von Materialmengen für Fußbodenheizungen inkl. Verteilerkasten-Auslegung.

## Funktionen

- **Raumerfassung** mit Fläche, Verlegabstand, Zielkreislänge
- **Automatische Berechnung** von Rohr-, Schienen- und Klipsmengen
- **Verteiler-Auslegung** (metalplast / Stramax) mit Kastenempfehlung
- **Anschluss-Sets** von metalplast, Stramax, Danfoss, Oventrop, TA-Compact
- **CAD-Import** aus Excel-Exporten (Flächen & Raumbezeichnungen)
- **Export / Import** als JSON-Projektdatei
- **Autosave** im Browser-LocalStorage
- Läuft vollständig lokal im Browser – **keine Installation, kein Server**

## Verwendung

1. `index.html` im Browser öffnen (kein Server notwendig)
2. Projekt-Bezeichnung eingeben
3. Verteiler und Räume anlegen
4. Optional: CAD-Daten aus Excel importieren
5. Projekt als `.json` exportieren/importieren

## Eigene Projektdaten

Alle eingegebenen Daten (Räume, Maße, Einstellungen) werden ausschließlich im **Browser-LocalStorage** gespeichert und verlassen Ihren Computer nicht. Exportierte `.json`-Dateien sind Projektdateien und liegen lokal bei Ihnen.

## Lizenz

Dieses Tool ist für den privaten und gewerblichen Gebrauch vorgesehen.
