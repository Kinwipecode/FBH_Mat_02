# Dokumentation & Leitfaden: Standardisierte Backup-Erstellung

Diese Dokumentation ist in zwei Abschnitte unterteilt:
1. **Teil A (UNIVERSELL):** Ein generischer Standard-Leitfaden, der **für JEDES Web- & Softwareprojekt** verwendet werden kann.
2. **Teil B (SPEZIFISCH):** Die konkrete Dateiliste und Pfade für dieses Projekt (**FBH Materialplaner**).

---

# TEIL A: Universeller Standard-Leitfaden (Gültig für ALLE Web-Projekte)

Dieser Teil ist **100% wiederverwendbar** und kann in jedes neue Projekt kopiert werden.

## 1. Universelle Backup-Prinzipien
1. **Vollständigkeit:** Jedes Backup muss alle Quellcodedateien (`.html`, `.js`, `.css`), Konfigurationsdateien (`.json`), Skripte (`.bat`, `.ps1`), Dokumentationen (`.md`) und Asset-Medien enthalten.
2. **Benutzer-Anweisung / Auslöser:** Backups werden **ausschließlich auf expliziten Wunsch des Benutzers** erstellt (z. B. wenn der Benutzer „erstelle backup“ sagt). Es werden keine automatischen Backups bei normalen Code-Änderungen erstellt.
3. **Stand-Alone Portabilität:** Ein entpacktes Backup muss auf jedem beliebigen Ziel-PC ohne Vorinstallationen per Doppelklick auf ein Start-Skript (`Start_App.bat` / `Start_FBH_Mat.bat`) sofort laufen.
4. **Bereinigung temporärer Dateien:** Beim Erstellen eines neuen Backups werden alte Backup-Ordner (`Backup_*`), Archiv-Dateien (`*.zip`) und Versionsverwaltung-Caches (`.git*`, `node_modules/` falls zutreffend) automatisch von der Sicherung ausgeschlossen.

## 2. Universelles Benennungsschema
* **Standard-Backup:** `Backup_YYMMDD` (Beispiel: `Backup_260819` für den 19. August 2026)
* **Fortlaufende Buchstaben bei mehreren Backups am selben Tag:** Falls an demselben Tag weitere Backups oder ZIP-Dateien entstehen, wird am Ende der Bezeichnung automatisch ein fortlaufender Großbuchstabe (`B`, `C`, `D`, ...) angehängt, um bestehende Sicherungen niemals zu überschreiben.
  - 1. Backup des Tages: `Backup_260819` & `Backup_260819.zip`
  - 2. Backup des Tages: `Backup_260819B` & `Backup_260819B.zip`
  - 3. Backup des Tages: `Backup_260819C` & `Backup_260819C.zip`
  - 4. Backup des Tages: `Backup_260819D` & `Backup_260819D.zip`

## 3. Universelles PowerShell-Erstellungsskript
Dieser Befehl kann in jedem beliebigen Projekt-Ordner ausgeführt werden. Er prüft automatisch, ob für den heutigen Tag bereits Backups existieren, und wählt automatisch den nächsten freien fortlaufenden Buchstaben (`B`, `C`, `D`...):

```powershell
# Backup-Skript mit Speicherung im Zielordner \Backup\
$workDir = (Get-Item .).FullName
$destParent = Join-Path $workDir "Backup"
if (-not (Test-Path $destParent)) { New-Item -ItemType Directory -Path $destParent | Out-Null }

$dateStr = (Get-Date -Format 'yyMMdd')
$baseName = "Backup_$dateStr"

# Bestimme naechsten freien Buchstaben (Backup_YYMMDD, Backup_YYMMDDB, Backup_YYMMDDC...)
if (-not (Test-Path "$destParent\$baseName") -and -not (Test-Path "$destParent\$baseName.zip")) {
    $targetName = $baseName
} else {
    $letterIndex = 66 # ASCII fuer 'B' (65='A', 66='B')
    do {
        $char = [char]$letterIndex
        $targetName = "${baseName}${char}"
        $letterIndex++
    } while (Test-Path "$destParent\$targetName" -or Test-Path "$destParent\$targetName.zip")
}

$backupDir = Join-Path $destParent $targetName
$zipPath = Join-Path $destParent "$targetName.zip"

# 1. Zielordner anlegen
New-Item -ItemType Directory -Path $backupDir | Out-Null

# 2. Alle Projektdateien kopieren (Backup-Ordner, ZIPs und Git ausschliessen)
Get-ChildItem -Path $workDir -Exclude 'Backup*', '*.zip', '.git*' | Copy-Item -Destination $backupDir -Recurse -Force

# 3. Ordner in ZIP-Archiv verpacken
Compress-Archive -Path "$backupDir\*" -DestinationPath $zipPath -Force

# 4. Ungezippten Ordner nach Erstellung der ZIP-Datei loeschen (nur ZIP bleibt)
Remove-Item -Path $backupDir -Recurse -Force

Write-Host "Vollstaendiges Backup erfolgreich erstellt in: $zipPath"
```

---

# TEIL B: Spezifische Konfiguration (FBH Materialplaner)

Dieser Teil listet die spezifischen Dateien dieses Projekts auf.

## Specific Project Directory: `g:\FBH_Mat_2`

> [!IMPORTANT]
> **Zukünftiger Backup-Zielordner:**
> Alle zukünftigen Backups werden als `.zip`-Dateien im Unterverzeichnis **`G:\FBH_Mat_2\Backup\`** erstellt (z. B. `G:\FBH_Mat_2\Backup\Backup_260823.zip`). Der temporäre ungezippte Ordner wird nach der Komprimierung automatisch gelöscht, sodass ausschließlich die fertige `.zip`-Datei im Backup-Ordner verbleibt.

### Pflichtinhalt-Checkliste:

| Datei / Ordner | Typ | Spezifischer Zweck im FBH-Projekt |
| :--- | :---: | :--- |
| **`index.html`** | HTML | Hauptseite & Benutzeroberfläche des Materialplaners. |
| **`script.js`** | JS | Anwendungslogik, Berechnungen, Drag-and-Drop & Auto-Sync. |
| **`style.css`** | CSS | Styling, Themes & CSS-Variablen. |
| **`default_toolbar_layout.js`** | JS | Browser-übergreifendes Standard-Menulayout für Erststart. |
| **`menu_layout.json`** | JSON | Entkoppelte Menulayout-Konfigurationsdatei. |
| **`fbhv_database.js`** | JS | Verteilerkasten-Datenbank & Optionen. |
| **`glossar.html`** | HTML | Hilfe- & Glossar-Dokument. |
| **`Start_FBH_Mat.bat`** | BAT | Start-Skript für den lokalen Webserver (öffnet exakt 1 Browser-Tab). |
| **`Apply_Menu_Layout.bat`** | BAT | Batch-Skript zur Übertragung von `menu_layout.json` in den Code. |
| **`Apply_Menu_Layout.ps1`** | PS1 | PowerShell-Helfer mit automatischer Zeitstempel-Synchronisation. |
| **`menu_drag_and_drop_notes.md`** | MD | Master-Dokumentation aller Menüs & Drag-and-Drop Regeln. |
| **`menu_layout_tasks_notes.md`** | MD | Aufgaben- und Prüfnotiz zur Menübearbeitung. |
| **`backup_instructions_notes.md`** | MD | Diese Anleitung zur Backup-Erstellung. |
| **`FBHV_Kasten/`** | Ordner | Enthält Verteilerkasten-PDFs & Assets. |

---

## Inbetriebnahme auf einem beliebigen PC:
1. Kopieren Sie `Backup_YYMMDD.zip` auf den Ziel-PC.
2. Entpacken Sie die ZIP-Datei in ein beliebiges Verzeichnis.
3. Doppelklicken Sie auf **`Start_FBH_Mat.bat`**.
