# Aufgaben-Notiz & Prüfliste: Menü-Bearbeitung & Layout-Synchronisation

Dieses Dokument dient als zentrale Notiz und Prüfliste für die Implementierung der Menü-Bearbeitung, des kollisionsfreien Drag-and-Drop Layouters, der Entkopplung der Menü-Dateien vom Projekt-Code und des Batch-Skripts zur spielweiten Browser-Synchronisation.

---

## 1. Übersicht der Anforderungen & Umsetzung

| Anforderung | Status | Implementierungs-Details |
| :--- | :---: | :--- |
| **1. Ein-Knopf-Bearbeitung** | ✅ Umgesetzt | Ein zentraler Umschaltknopf (`#btn-toggle-menu-edit`) steuert den Bearbeitungsmodus für **alle** Menü-Bereiche gleichzeitig (Top-Bar, Menüzeilen & Verteiler-Header). Bei inaktivem Modus sind Knöpfe fixiert und Drag-Griffe (`⋮⋮`) ausgeblendet. Bei aktivem Modus (`✔ Bearbeitung beenden`) können Knöpfe in allen Bereichen frei bewegt und Zeilen verwaltet werden. |
| **2. Freie Verschiebbarkeit** | ✅ Umgesetzt | Alle Elemente innerhalb der Menüleisten (`.toolbar-item`) können frei per Drag & Drop an jede beliebige X-Position verschoben werden. |
| **3. Überlappungsschutz & Nach-Rechts-Schieben** | ✅ Umgesetzt | Implementiert in `resolveDropOverlapByPushingRight()`. Elemente dürfen nicht übereinander liegen. Wird ein Element zwischen zwei Knöpfe abgelegt, weicht das rechte Element (und alle weiteren rechts davon) automatisch nach rechts aus. |
| **4. Zeilenübergreifendes Verschieben** | ✅ Umgesetzt | Jedes Element kann in jede beliebige Zeile (Zeile 0, Zeile 1, Zeile 2 etc.) gedragged werden. Neue Zeilen können im Bearbeitungsmodus über `➕ Zeile hinzufügen` angelegt werden. |
| **5. Entkopplung vom Projekt-Code** | ✅ Umgesetzt | Das Menü-Layout wird nicht mehr im Projekt-JSON (`fbhData`) gespeichert, sondern separat in `menu_layout.json` abgelegt und per `💾 Layout speichern` / `📂 Layout laden` verwaltet. |
| **6. App-Code Übertragung per Batch-Skript** | ✅ Umgesetzt | Die Datei `Apply_Menu_Layout.bat` liest bei geschlossener Anwendung `menu_layout.json` ein und aktualisiert `default_toolbar_layout.js` (per PowerShell). Dadurch laden alle Browser (Chrome, Edge, Firefox, Inkognito) beim Starten exakt dieselbe Menü-Darstellung. |
| **7. Dokumentations- & Prüfnotiz** | ✅ Umgesetzt | Diese Notiz (`menu_layout_tasks_notes.md`) fasst alle Aufgaben, die Architektur und die Prüfkriterien für spätere Kontrolle zusammen. |

---

## 2. Architektur & Dateistruktur

* **[default_toolbar_layout.js](file:///g:/FBH_Mat_2/default_toolbar_layout.js):** 
  Enthält das globale JS-Objekt `window.DEFAULT_TOOLBAR_LAYOUT`, welches beim ersten Starten der App geladen wird.
* **[menu_layout.json](file:///g:/FBH_Mat_2/menu_layout.json):** 
  Die eigenständige Konfigurationsdatei für das Menü-Layout (Reihenfolge, Zeilen, X-Koordinaten `left`, ausgeblendete Knöpfe).
* **[Apply_Menu_Layout.bat](file:///g:/FBH_Mat_2/Apply_Menu_Layout.bat):** 
  Das Windows-Batchskript zur Übertragung von `menu_layout.json` nach `default_toolbar_layout.js` bei geschlossener App.
* **[index.html](file:///g:/FBH_Mat_2/index.html):** 
  Beinhaltet den neuen Bearbeitungs-Knopf `#btn-toggle-menu-edit`, die Aktionsleiste `#menu-edit-actions` und bindet `default_toolbar_layout.js` ein.
* **[script.js](file:///g:/FBH_Mat_2/script.js):** 
  Steuert den `isMenuEditMode`-Status, verhindert Drag-Events im normalen Modus, führt die Kollisions-Kaskadierung durch und steuert den Datei-Export/Import.

---

## 3. Nachprüfungs- & Testanleitung (Checkliste)

Nutzen Sie diese Schritte, um die korrekte Funktion zu prüfen:

- [ ] **Test 1: Bearbeitungsmodus Umschalten**
  1. Seite in `index.html` öffnen.
  2. Prüfen, ob Drag-Griffe `⋮⋮` initial ausgeblendet sind und Knöpfe sich nicht ziehen lassen.
  3. Auf `✏️ Menüs bearbeiten` klicken.
  4. Der Knopf schaltet auf grün `✔ Bearbeitung beenden` um, Drag-Griffe `⋮⋮` werden sichtbar, und `💾 Layout speichern`, `📂 Layout laden`, `➕ Zeile hinzufügen` erscheinen.

- [ ] **Test 2: Freies Verschieben & Kollisions-Schieben**
  1. Im Bearbeitungsmodus einen Knopf am Griff `⋮⋮` fassen.
  2. Den Knopf zwischen zwei andere Knöpfe ziehen und loslassen.
  3. Prüfen: Der rechte Knopf rückt automatisch nach rechts ab. Es gibt keine Überlappungen.
  4. Einen Knopf in eine andere Zeile oder eine neu erstellte Zeile ziehen.

- [ ] **Test 3: Layout in Datei speichern (`menu_layout.json`)**
  1. Auf `💾 Layout speichern` klicken.
  2. Prüfen, dass eine Datei `menu_layout.json` heruntergeladen/gespeichert wird.
  3. Ein normales Projekt speichern (`💾 Export`) und im Texteditor öffnen: Es dürfen keine `toolbarLayout`-Attribute enthalten sein.

- [ ] **Test 4: Batch-Skript Ausführen (`Apply_Menu_Layout.bat`)**
  1. Den Browser/die Anwendung schließen.
  2. Doppelklick auf `Apply_Menu_Layout.bat`.
  3. Prüfen, dass in der Konsole `[Erfolg] Das Menue-Layout wurde erfolgreich in den App-Code uebertragen!` angezeigt wird.
  4. `default_toolbar_layout.js` im Editor öffnen und prüfen, ob die neuen Koordinaten eingetragen wurden.
  5. Die App in verschiedenen Browsern (oder im Inkognito-Fenster) öffnen: Die Darstellung ist in allen Browsern exakt identisch.

---

## 4. WICHTIGE WARNUNGEN & ENTWICKLER-CHECKLISTE (VERMEIDUNG VON VERTEILER-AUSFÄLLEN)

> [!WARNING]
> **KRITISCHER PUNKT: NIEMALS UNGEPRÜFTE DOM-SELECTOREN ANWENDEN**
> Wenn Knöpfe oder Elemente in `tpl-floor-header` oder im HTML verschoben/entfernt werden:
> - In `script.js` MUSS jedes `.querySelector(...)` mit einerm `if (...)` abgesichert sein!
> - Beispielsyntax: `const btn = tr.querySelector('.btn-name'); if (btn) btn.addEventListener(...);`
> - Ohne `if` wirft der Browser einen `TypeError: Cannot read properties of null (reading 'addEventListener')`, der das Laden der Verteiler-Tabelle komplett stoppt.

> [!NOTE]
> **SYNTAX-SCHLEIFEN-KONTROLLE VOR CODE-FINISCH:**
> Bei jedem Edit in `script.js` muss sichergestellt sein, dass keine unvollständigen Schleifen (z. B. abgebrochene `for (const item of ...)` Zeilen) entstehen.

> [!TIP]
> **VERTEILER-LAYOUT-VERERBUNG:**
> Alle Anpassungen im Verteiler-Menü werden in `savedFloorHeaderOrder` abgelegt und bei jedem neu erzeugten Verteiler (`addNewFloor()`) automatisch angewendet (`applyFloorHeaderLayoutToFloor()`).

> [!IMPORTANT]
> **FEINES SEKTOR-RASTER (10PX) & FENSTER-SKALIERUNGSSCHUTZ:**
> - Alle Menüzeilen nutzen ein feines 10px-Sektor-Raster (`GRID_SECTOR_SIZE = 10`), um Knöpfe exakt in Positionen einzurasten.
> - Es dürfen KEINE dynamischen Window-Resize-Listener eingebaut werden, die beim Verkleinern des Browsers die gespeicherten Positionskoordinaten überschreiben.
> - Beim Verkleinern greift `overflow-x: auto`. Beim Wieder-Vergrößern des Browsers bleiben alle Knöpfe an ihren exakt zugewiesenen Sektor-Positionen verankert.

> [!TIP]
> **PFEILTASTEN-JUSTIERUNG (5PX-SCHRITTE):**
> Im Bearbeitungsmodus (`✏️ Menüs bearbeiten`) kann jeder Knopf angeklickt und mit **`←` / `→`** in deutlich sichtbaren **5px-Schritten** verschoben werden (`Shift + Pfeil` für 25px). Mit **`↑` / `↓`** wechselt der Knopf die Zeile.

> [!CAUTION]
> **DEAKTIVIERUNG ALLER KNOPF-FUNKTIONEN IM BEARBEITUNGSMODUS:**
> - Solange der Bearbeitungsmodus (`✏️ Menüs bearbeiten`) aktiv ist, werden ALLE Klick-Funktionen der Knöpfe (Drucken, Hilfe, Löschen, Klappen usw.) über Capturing-Events (`useCapture = true`, `stopImmediatePropagation()`) stummgeschaltet.
> - Ein Klick auf ein Element wählt dieses ausschließlich zum Verschieben aus, ohne versehentlich die hinterlegte Aufgabe auszuführen.
