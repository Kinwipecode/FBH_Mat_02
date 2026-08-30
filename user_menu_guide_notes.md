# Master-Benutzerhandbuch: Visuelle Menü- & Knopf-Anleitung (FBH Material Rechner)

Dieses Dokument dient als erweiterbares Benutzerhandbuch für den FBH Material Rechner. Es beschreibt die exakten Funktionen aller Menü-Knöpfe und Benutzeroberflächen-Elemente mit ihren visuellen Icons.

---

## 1. Übersicht der Menü-Kategorien & Knöpfe

### ✏️ Menü-Bearbeitung & Layout-Steuerung
Steuert den Bearbeitungsmodus und die Anpassung der Knopf-Anordnung im Rechner:

| Knopf / Icon | Funktion & Beschreibung | Praxistipp |
| :--- | :--- | :--- |
| `✏️ Menüs bearbeiten` | Schaltet den Bearbeitungsmodus für alle Menübereiche ein oder aus. | Bei aktivem Modus können Knöpfe per Drag & Drop oder **Pfeiltasten (← → ↑ ↓)** in 5px-Schritten verschoben werden. |
| `💾 Layout speichern` | Speichert die aktuelle Knopf-Anordnung in der Datei `menu_layout.json`. | Nach dem Anpassen klicken, um das Layout dauerhaft als Datei zu sichern. |
| `📂 Layout laden` | Lädt eine gespeicherte `menu_layout.json` ein. | Stellt die Anordnung sofort im Browser wieder her. |
| `⚡ Code-Sync App (.exe)` | Startet die eigenständige Windows-App `FBH_Layout_Sync_Manager.exe`. Bietet einen Dateibrowser (`📂 Durchsuchen...`) und merkt sich den zuletzt gewählten Pfad. | Überträgt das Layout in den App-Code, sodass **alle Browser** das Layout laden. |
| `➕ Zeile hinzufügen` | Erzeugt eine neue leere Menüzeile in der Haupt-Toolbar. | Zum freien Einsortieren eigener Knopf-Gruppen. |
| `🔄 Anordnung zurücksetzen` | Setzt das Menü-Layout auf den Werkszustand zurück. | Setzt alle Zeilen und Positionen zurück. |
| `📏 Spaltenbreiten` | Passt die Spaltenbreiten der Verteiler-Tabelle an. | Funktioniert wie in Microsoft Excel. |

---

### 🛠️ Haupt-Toolbar & Filter-Knöpfe
Allgemeine Hilfsmittel und Tabellen-Suchfilter:

| Knopf / Icon | Funktion & Beschreibung | Praxistipp |
| :--- | :--- | :--- |
| `ℹ️ Hilfe` | Öffnet die interaktive Knopf-Anleitung & das Glossar im neuen Tab. | Ideal für Einsteiger und Nachschlagen. |
| `💡 Info: Aus / Ein` | Aktiviert oder deaktiviert schwebende Tooltip-Erklärungen. | Blendet Erklärungstexte bei Maus-Hover ein. |
| `📁 Zielordner` | Zeigt den aktuellen Projekt-Speicherordner an. | Klick öffnet die Ordnerwahl auf der Festplatte. |
| `🔍 Geschoss filtern...` | Filtert die Tabelle nach Geschossnamen (z. B. "EG"). | Live-Filterung während des Tippens. |
| `🔍 Verteiler / FBHV filtern...` | Filtert die Tabelle nach Verteiler-Bezeichnungen. | Live-Filterung für spezifische HKVs. |
| `🛠️ Tools` | Öffnet das Tools-Fenster für unbenutzte Menü-Knöpfe. | Knöpfe können hier zwischengelagert werden. |

---

### ⚙️ Berechnungs-, Berichts- & Projekt-Knöpfe
Hauptwerkzeuge für Projektdaten, Berichte und Berechnungen:

| Knopf / Icon | Funktion & Beschreibung | Praxistipp |
| :--- | :--- | :--- |
| `🗑️ Neu` | Startet ein neues Projekt. Zeigt ein Info-Fenster an und öffnet direkt den Datei-Browser zur Zielordner-Auswahl. | So ist das neue Projekt von Beginn an mit Ihrem Festplatten-Ordner verknüpft. |
| `📂 Projekt` | Öffnet die Dateiliste des verknüpften Zielordners zum Einlesen, Laden oder Anlegen von Projekten. | Mit Icon 📂 (Ordner öffnen). |
| `💾 Projekt` | Speichert das aktuelle Projekt direkt als `.json`-Datei im Zielordner. | Mit Icon 💾 (Speichern). |
| `📊 Import aus CAD` | Importiert Raumlisten aus Excel-CAD-Exporten. | Verarbeitet CAD-Massenberechnungen. |
| `📋 CAD-Pool` | Öffnet den CAD-Raumpool für Drag-and-Drop. | Räume bequem in Verteiler ziehen. |
| `⚙️ Parameter` | Öffnet Einstellungen für Rohrtypen, Aufpreise & Voreinstellungen. | Projektweite Berechnungsregeln. |
| `🎨 Design` | Wechselt das Farb-Theme der Anwendung. | Z.B. Dark Mode, Light Mode, Modern Blue. |
| `🖨️ Drucken` | Erstellt einen PDF-Druckbericht oder öffnet den Druckdialog. | Ideal für Bauakten und Kundenangebote. |
| `📦 FBHV-Konfig` | Konfiguriert zugelassene Verteilerkasten-Typen. | Beschränkt Optionen auf gewählte Hersteller. |
| `📊 Verteiler-Übersicht` | Zeigt eine Zusammenfassung aller Verteiler im Projekt. | Schneller Überblick über Abmessungen. |
| `📋 Rapportliste` | Öffnet die vollständige Material-Stückliste. | Rohrmeter, Thermostate, Antriebe etc. |
| `💾 Export` / `📂 Import` | Speichert/Lädt Projekte als `.json`-Datei über den Browser. | Standard-Dateiaustausch. |
| `🔍 DB-Check` | Prüft die Auslegung für 1 bis 12 Heizkreise. | Validierung gegen Datenbankregeln. |

---

### ✍️ Verteiler- & Schnell-Aktionen
Aktionen zur schnellen Bearbeitung von Geschossen und Räumen:

| Knopf / Icon | Funktion & Beschreibung |
| :--- | :--- |
| `Vert+` | Fügt ein neues Geschoss bzw. einen neuen Verteiler hinzu. |
| `Raum+` | Fügt dem aktiven Verteiler einen neuen Raum hinzu. |
| `📋 Text Multi.` | Multi-Stempel-Modus zum mehrfachen Einfügen kopierter Texte per Klick. |
| `🗑️ Pos. Nr.` | Löscht die Positionsnummern aller aktiven Verteiler. |
| `🚗 Pos. Auto` | Vergibt fortlaufende Pos. Nrn. automatisch von oben nach unten. |
| `Copy Vert.` | Dupliziert den gewählten Verteiler samt allen Räumen. |
| `↑↓ Vert.` | Verteiler-Verschiebemodus per Pfeiltasten (↑ / ↓). |

---

### 🏢 Verteiler-Kopfzeile (Steuerungselemente)

| Element / Icon | Funktion & Beschreibung |
| :--- | :--- |
| `▼` | Klappt die Räume des Verteilers ein oder aus. |
| `🗑️` | Löscht das Geschoss inklusive aller zugehörigen Räume. |
| `☐ Sync` | Fügt den Verteiler zur Sync-Gruppe für synchrone Änderungen hinzu. |
| `Anschl.: Hor / Ver` | Bestimmt horizontalen oder vertikalen Rohranschluss. |
| `🚗 Kasten-Typ` | Wählt den Verteilerkastentyp (Auto = Empfehlung). |
| `Verteilerkasten: B × H × T` | Zeigt die Abmessungen in mm (Breite × Höhe × Tiefe). |

---

## 💡 Entwickler-Anleitung: So fügen Sie neue Knöpfe hinzu

Wenn neue Funktionen oder Menü-Knöpfe zum FBH Material Rechner hinzugefügt werden, können diese in 3 einfachen Schritten in die Dokumentation und das visuelle Handbuch (`glossar.html`) eingepflegt werden:

### Schritt 1: HTML-Karte in `glossar.html` einfügen
Fügen Sie einen neuen Karten-Block in die entsprechende Kategorie in `glossar.html` ein:

```html
<div class="btn-card" data-keywords="neuer-knopf icon funktion bezeichnung">
    <div class="btn-card-header">
        <span class="btn-visual-pill">🚀 Neuer Knopf-Name</span>
        <span class="btn-tag">Kategorie</span>
    </div>
    <div class="btn-card-body">
        <p><strong>Beschreibung:</strong> Erklären Sie hier kurz die Funktion des neuen Knopfes.</p>
        <div class="btn-card-tip">
            💡 <strong>Tipp:</strong> Praktischer Anwendungshinweis für Nutzer.
        </div>
    </div>
</div>
```

### Schritt 2: Markdown-Tabelle in `user_menu_guide_notes.md` ergänzen
Fügen Sie den neuen Knopf in die entsprechende Tabelle in dieser Notiz ein:

```markdown
| `🚀 Neuer Knopf` | Kurze Funktionsbeschreibung | Praxistipp |
```

### Schritt 3: Layout-Synchronisation prüfen
Stellen Sie sicher, dass die Knopf-ID in `menu_layout.json` eingetragen ist und führen Sie `Apply_Menu_Layout.bat` aus.
