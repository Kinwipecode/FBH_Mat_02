# Master-Dokumentation: Drag-and-Drop & Menü-Architektur (FBH Material Rechner)

Dieses Dokument beschreibt die vollständige Architektur, Datenstrukturen und Funktionsweise aller Menübereiche und des Drag-and-Drop-Systems im FBH Material Rechner.

---

## 1. Übersicht der Menü-Struktur

Die Anwendung gliedert sich in drei klare Menübereiche:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP INFO BAR (Fixiert):  🔥 Logo | Objektbez. | v1.0 | ✏️ Menüs bearbeiten             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ HAUPT-TOOLBAR (Menü 2):  Zeile 1: ℹ️ Hilfe | 💡 Info | 📁 Zielordner | 🔍 Filter | 🛠️ Tools│
│ (#toolbar-rows-container) Zeile 2: ⚙️ Parameter | 🎨 Design | 🖨️ Drucken | 📦 FBHV-Konfig...│
│                           Zeile 3: 💾 In Ordner | 📊 CAD | 📊 Verteiler-Übersicht...    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ VERTEILER-HEADER (Menü 3):Zeile 1: ✍️ FBHV | 🏢 Geschoss | 📋 Vert. kopieren            │
│ (.fh-drag-row)            Zeile 2: ▼ ✖ Vert+ Vert📋 Raum+ | Anschl. | Kasten...        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Haupt-Toolbar System (Menü 2 - Pixelgenaue absolute Positionierung)

Alle Knöpfe in `#toolbar-rows-container` nutzen ein absolut positioniertes Layout (`position: absolute !important`), was das freie Platzieren an jedem beliebigen Pixel sowie das automatische Ausweichen der Nachbarn ermöglicht.

### Key CSS-Regeln
* `.toolbar-row`: Dauerhaft `position: relative`. Stellt den Bezugsrahmen für alle Knopf-Koordinaten dar.
* `.toolbar-item`: Dauerhaft `position: absolute !important`. Behält die absolute Positionierung auch bei Deaktivierung von `draggable`.
* `#tools-pool-container .toolbar-item`: Überschrieben mit `position: relative !important` für automatisches Flex-Wrap-Layout im Tools-Fenster.

### Kollisionslöser (`resolveDropOverlapByPushingRight`)
Wird beim Droppen eines Knopfes auf eine Toolbar-Zeile aufgerufen:
1. **Initial-Prüfung:** Begrenzt die angeforderte `left`-Position auf mindestens `10px` und maximal `Zeilenbreite - Knopfbreite - 65px`.
2. **Pass 1 (Links-nach-Rechts):** Prüft jeden Knopf von links nach rechts. Überlappt ein Knopf seinen linken Nachbarn (`left < leftPrev + widthPrev + 10px`), wird er kaskadierend nach rechts geschoben.
3. **Pass 2 (Rechts-nach-Links):** Ragt ein Knopf am rechten Zeilenende heraus, wird er nach links korrigiert und schiebt bei Bedarf links liegende Nachbarn nach links ein.

---

## 3. Verteiler & Geschoss-Header System (Menü 3 - DOM Reordering)

Die Verteiler- und Geschoss-Kopfzeilen nutzen ein Flexbox-basiertes DOM-Reordering-System für Elemente mit der Klasse `.fh-draggable-item` in Zeilen mit `.fh-drag-row`.

### Zielsicherer Absetz-Algorithmus (`getClosestFhItem`)
```javascript
function getClosestFhItem(rowEl, clientX, ignoreItem)
```
Misst kontinuierlich die horizontale Distanz (X-Koordinate) vom Mauszeiger zum Mittelpunkt aller Knöpfe in der Zeile:
* **Dragover Vorschau:** Zeigt mit einer blauen Linie (`fh-drop-before` / `fh-drop-after`) exakt an, vor oder nach welchem Knopf das Element abgelegt wird.
* **Drop Platzierung:** Platziert das Element zielsicher an der berechneten Stelle (`insertBefore`) – selbst beim Loslassen auf Lücken, Rändern oder Freiflächen.

### Globales Template-Prinzip (`applyFhOrderToAll`)
Da alle Verteiler aus demselben Template (`tpl-floor-header`) erzeugt werden, gilt eine **einzige gemeinsame Reihenfolge für alle Verteiler**:
* Wird die Reihenfolge in einem Verteiler geändert, synchronisiert `applyFhOrderToAll(changedRow)` die Reihenfolge sofort live auf **alle** Verteiler im Dokument.

---

## 4. Zentrale Ein-Knopf-Steuerung (`✏️ Menüs bearbeiten`)

Die Bearbeitung aller Menübereiche wird zentral über den Knopf `btn-toggle-menu-edit` gesteuert (`setMenuEditMode(isEditMode)`):

1. **Umschalten:** Fügt die Klasse `menu-edit-mode` zu `document.body` hinzu oder entfernt sie.
2. **Exakte Abmessungs-Garantie (Zero-Width Shift):** Inline-Textgriffe (`.drag-handle`, `.fh-dh` `⋮⋮`) sind ausgeblendet (`display: none !important;`), sodass die Button-Abmessungen im Bearbeitungsmodus zu **100% mathematisch exakt auf den Einzelpixel identisch** mit der normalen Ansicht bleiben.
3. **Visuelle Indikatoren im Bearbeitungsmodus:**
   - Bewegliche Knöpfe & Elemente erhalten eine blauen gestrichelten Rahmen (`outline: 1.5px dashed var(--primary-color)`).
   - Beim Hovern erscheint der Greif-Mauszeiger (`🖐️ / grab`).
   - Beim Auswählen erscheint der blaue Foki-Ring (`.selected-menu-item`).
4. **Mandatory Action Deactivation Guard (Funktionen im Bearbeitungsmodus IMMER ausgeschaltet):**
   - Während des Bearbeitungsmodus (`body.menu-edit-mode`) sind **ALLE** Knopf- und Steuerungselemente-Aktionen (Löschen `🗑️`, Ein-/Ausklappen `▼`, Checkboxen `Hor`/`Ver`, Dropdowns, Berichte drucken etc.) in der Capture-Phase (`e.stopImmediatePropagation()`) zu 100% deaktiviert.
   - Ein Klick auf ein beliebiges Element dient **ausnahmslos** nur der Auswahl (`.selected-menu-item`) und Vorbereitung für Verschiebung per Pfeiltasten oder Maus.
5. **Pfeiltasten-Nudging:**
   - `←` / `→`: Verschiebt den gewählten Knopf um **5 Pixel** (mit Shift: **25 Pixel**).
   - `↑` / `↓`: Verschiebt den Knopf zeilenübergreifend.
6. **Striker Rechter-Rand-Stopp & Benachrichtigung:**
   - Wenn beim Verschieben (per Maus oder Pfeiltasten) der rechte Rand der Zeile/Tabelle erreicht ist, stoppt das Element **exakt an der Kante**.
   - Die Menü- oder Zeilenbreite wird **NIEMALS automatisch verbreitert**.
   - Es erscheint eine elegante Benachrichtigung (`showMenuBoundaryToast`):
     `"⚠️ Rechter Rand erreicht! Das Menü wird nicht automatisch verbreitert."`

---

## 5. Layout-Speicherung & Synchronisation

### Datenstruktur (`menu_layout.json` & `localStorage.fbhToolbarLayout`)
```json
{
  "rows": [
    {
      "collapsed": false,
      "items": [
        { "id": "btn-help", "left": 15 },
        { "id": "btn-toggle-tooltips", "left": 120 },
        { "id": "btn-select-folder", "left": 250 },
        { "id": "main-floor-filter", "left": 560 },
        { "id": "main-fbhv-filter", "left": 740 },
        { "id": "btn-open-tools", "left": 920 }
      ]
    },
    {
      "collapsed": false,
      "items": [
        { "id": "btn-settings", "left": 15 },
        { "id": "btn-design", "left": 160 },
        { "id": "btn-print-report", "left": 280 },
        { "id": "btn-verteilerkasten-config", "left": 440 },
        { "id": "btn-open-rapportliste", "left": 600 },
        { "id": "btn-multi-paste", "left": 760 }
      ]
    },
    {
      "collapsed": false,
      "items": [
        { "id": "btn-save-to-folder", "left": 15 },
        { "id": "btn-load-from-folder", "left": 175 },
        { "id": "btn-import-cad", "left": 335 },
        { "id": "btn-open-cad-pool", "left": 485 },
        { "id": "btn-open-verteiler-overview", "left": 615 },
        { "id": "btn-export-file", "left": 790 },
        { "id": "btn-import-file", "left": 885 },
        { "id": "btn-clear-cache", "left": 985 }
      ]
    }
  ],
  "toolsPool": [],
  "floorHeaderOrder": {
    "meta-row1": ["input-fbhv", "input-floor", "copy-header"],
    "row2-left": ["toggle-floor", "delete-floor", "add-floor", "copy-floor", "add-room", "anschl-group", "kasten-select"],
    "row2-right": ["kasten-dims", "ansch-set-group"]
  }
}
```

### Automatic Browser Sync via Timestamps (`updatedAt`)
* **Problem gelöst:** Wenn ein anderer Browser früher bereits gestartet war, hatte er ein veraltetes Layout im `localStorage` gespeichert. Vorher musste man in diesem Browser einmalig manuell auf `📂 Layout laden` klicken, um die aktualisierte `menu_layout.json` zu übernehmen.
* **Automatische Lösung:**
  1. Jedes Speichern erzeugt einen Zeitstempel (`updatedAt: Date.now()`).
  2. `Apply_Menu_Layout.bat` überträgt diesen Zeitstempel nach `default_toolbar_layout.js`.
  3. Beim Starten prüft `script.js` in **jedem** Browser automatisch: Ist das übertragene `default_toolbar_layout.js` neuer als das lokale `localStorage` dieses Browsers?
  4. Wenn ja, übernimmt der Browser das neue Layout **sofort und vollautomatisch beim Start**, ohne dass der Benutzer manuell klicken oder den Speicher leeren muss!


---

## 6. Schlüssel-Funktionen in `script.js`

| Funktion | Beschreibung / Aufgabe |
|---|---|
| `initDraggableToolbar()` | Initialisiert die Menü 2 Toolbar-Zeilen, Drag-Listener und lädt das gespeicherte Layout. |
| `resolveDropOverlapByPushingRight()` | Berechnet Knopf-Koordinaten, löst Überlappungen und stellt Randgrenzen sicher. |
| `saveLayout()` | Speichert aktuelles Toolbar- & Verteiler-Layout in `localStorage` und stösst Autosave an. |
| `restoreLayout(layoutData)` | Baut die Toolbar-Zeilen aus dem Layout-Objekt neu auf und ordnet Knöpfe zu. |
| `setMenuEditMode(isEditMode)` | Schaltet den Bearbeitungsmodus für alle Menübereiche ein/aus. |
| `getClosestFhItem(rowEl, clientX, ignoreItem)` | Zielsichere Erkennung des nächstgelegenen Knopfes in Flexbox-Zeilen. |
| `attachFhRowListeners(rowEl)` | Drag & Drop Event-Handling für Verteiler-Kopfzeilen. |
| `applyFhOrderToAll(changedRow)` | Synchronisiert Verteiler-Zeilenordnung auf alle Verteiler im Dokument. |

---

## 7. KRITISCHE SICHERHEITS-NOTIZEN & PRÜFLISTE FÜR ENTWICKLER (Fehler-Vermeidung)

> [!CAUTION]
> **ABSOLUTES VERBOT UNGEPRÜFTER DOM-SELECTOREN IN DOM-INITIALISIERUNGEN**
> Wann immer ein Button oder Element aus einem HTML-Template (z.B. `tpl-floor-header` oder Toolbar) entfernt, verschoben oder umbenannt wird, darf im JavaScript (z.B. in `addNewFloor()`) NIEMALS ein direkter ungeprüfter Zugriff wie `trInfo.querySelector('.btn-add-room').addEventListener(...)` erfolgen!
> Wenn das Element im Template fehlt oder verschoben ist, gibt `.querySelector(...)` `null` zurück. Ein Aufruf `.addEventListener(...)` auf `null` wirft einen **schwerwiegenden uncaught TypeError**, der die gesamte Skript-Ausführung und das Rendern ALLER Verteiler/Tabellen im Browser sofort stoppt!

### Regelsatz für Menü- und Template-Änderungen:

1. **Null-Safety Guard Pflicht (IMMER mit `if` absichern):**
   ```javascript
   const btnAddRoom = trInfo.querySelector('.btn-add-room');
   if (btnAddRoom) {
       btnAddRoom.addEventListener('click', ...);
   }
   ```
   *Jedes* `querySelector` auf verschiebbare oder anpassbare Template-Elemente MUSS vor dem Hinzufügen von Event-Listenern mit einem `if (...)` abgesichert werden!

2. **Skript-Syntax-Prüfung vor dem Speichern:**
   Vor jedem Speichern von `script.js` MUSS sichergestellt sein, dass keine unvollständigen Schleifen (z.B. abgebrochene `for (const item of ...)` Zeilen) oder fehlenden Klammern im Code verbleiben.

3. **Verteiler-Kopfzeilen Layout-Vererbung (`applyFloorHeaderLayoutToFloor`):**
   - Wenn ein Element zwischen Zeile 1 (`meta-row1`) und Zeile 2 (`row2-left`/`row2-right`) verschoben wird, wird seine Zeilenzugehörigkeit, Reihenfolge und sein individueller Abstand (`marginLeft`) in `savedFloorHeaderOrder` gespeichert.
   - Neue Verteiler, die mit `addNewFloor()` erstellt werden, rufen automatisch `applyFloorHeaderLayoutToFloor(floorBody)` auf, damit alle neu erstellten Verteiler das exakt gleiche individuelle Menü-Design übernehmen.

4. **Kollisionsschutz & Freie Platzierung:**
   - In den Verteiler-Kopfzeilen wird das Ziel-Row-Element über `getTargetFhRow(headerContainer, clientX, clientY)` anhand der vertikalen Maus-Y-Koordinate ermittelt, sodass das Ziehen zwischen den Zeilen auch auf Freiflächen präzise reagiert.
   - Die Platzierung berechnet den Abstand `marginLeft = Math.max(0, clientX - prevRight)`. Dadurch ist freie Platzierung möglich, ohne dass Knöpfe jemals übereinanderlappen (`gap >= 0`).

5. **Feines Sektor-Raster-System & Layout-Schutz bei Fenster-Skalierung (`GRID_SECTOR_SIZE = 10`):**
   - Jede Menüzeile ist in feine 10px-Sektoren unterteilt (`snapToSector`).
   - Ein Knopf speichert seine Position dauerhaft im Sektor-Raster (`dataset.sector`).
   - NIEMALS dynamische `resize`-Listener einbinden, die `style.left` beim Verkleinern des Fensters mutieren oder überschreiben!
   - Beim Verkleinern/Zoomen greift `overflow-x: auto; overflow-y: hidden;`. Sobald das Fenster wieder vergrößert wird, bleiben ausnahmslos alle Knöpfe an ihren exakt zugewiesenen Sektor-Positionen verankert.

6. **Pfeiltasten-Justierung (5px-Schritte & Shift+Pfeil 25px):**
   - Im Bearbeitungsmodus (`menu-edit-mode`) wird ein angeklickter Knopf mit blauem Fokus-Rahmen markiert (`.selected-menu-item`).
   - `ArrowLeft` / `ArrowRight`: Verschiebt den Knopf mit deutlich sichtbaren **5px-Schritten** (mit `Shift` in **25px-Großschritten**).
   - `ArrowUp` / `ArrowDown`: Verschiebt den Knopf zeilenübergreifend nach oben oder unten.

7. **Deaktivierung aller Knopf-Funktionen im Bearbeitungsmodus:**
   - Im Bearbeitungsmodus (`menu-edit-mode`) werden ALLE Klick-Aktionen von Knöpfen (Drucken, Löschen, Hilfe öffnen, Ebenen klappen usw.) über einen Capturing-Listener (`useCapture = true`, `e.stopImmediatePropagation()`) vollständig deaktiviert.
   - Ein Klick auf einen Knopf wählt diesen ausschließlich zum Verschieben aus, ohne versehentlich die Knopf-Aufgabe auszuführen.
