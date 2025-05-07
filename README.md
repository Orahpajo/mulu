# Mulu

**Mulu** dient dazu, Musikstücke zu üben – sei es für Tanz oder Gesang.  
Man kann ein Lied oder Video in den lokalen Browser-Storage laden, den Text dazu in Markdown erfassen und bei laufendem Lied auf den Text tippen, um zu markieren, welche Textstelle zu welchem Teil des Lieds gehört. Danach kann man einfach auf Textstellen tippen, um im Lied dorthin zu springen. Außerdem kann man einen Loop-Bereich festlegen, der dann immer wieder wiederholt wird – wahlweise mit Einzählen vor jeder Wiederholung.

---

## 🔁 Weitere Loop-Funktionen

- **Mehrere Loops speichern**: Nicht nur ein Loop-Bereich, sondern mehrere benannte Loops anlegen (z. B. „Refrain“, „Bridge“, „Schwierige Stelle 1“).
- **Automatisches Durchlaufen mehrerer Loops**: Mit Pausen oder Wiederholungen dazwischen – z. B. für gezieltes Training.

---

## 🎵 Audio-Features

- **Abspielgeschwindigkeit anpassen** (ohne Tonhöhe zu ändern): Sehr nützlich für Gesang oder schwierige Tanzstellen.
- **Tonhöhe anpassen**: Hilfreich zum Singen in anderen Tonlagen.
- **EQ/Balance/Mono-Optionen**: Z. B. um Lead-Vocals besser zu hören oder zu unterdrücken.

---

## ⌨️ Markdown-Text-Features

- **Unterstützung für Abschnitte, Überschriften, Refrains etc.** per Markdown (`#`, `##`, `**` etc.).
- **Auto-Sync-Vorschläge**: Vorschläge für Textstellen durch Erkennung von Pausen oder Beats.
- **Option zum Importieren von LRC-Dateien**: Falls jemand bereits getimte Lyrics hat.

---

## 🧠 Übungsmodus

- **Quiz-Modus**: „Sing weiter ab hier“ – das Audio stoppt und der Text wird teilweise ausgeblendet.
- **Blenden-Modus**: Text wird bei Wiederholungen Stück für Stück weniger angezeigt.
- **Fortschrittsanzeige**: Z. B. wie oft eine Stelle korrekt geübt wurde.

---

## 📁 Verwaltung & Sharing

- **Export/Import-Funktion**: Lied, Markdown und Markierungen als Bundle speichern und laden.
- **Teilen per QR-Code oder Link**: Optional auch über Cloud/Backend, falls lokal nicht ausreicht.

---

## 🖱️ UI-Ideen

- **Mini-Wellenform-Ansicht**: Zur besseren Orientierung.
- **Text farblich markieren**: Nach Status („unmarkiert“, „markiert“, „Loop-Ziel“).
- **Tooltips oder visuelle Hinweise**: Beim Markieren oder Setzen von Loops.

---

## 🧰 Technisches

- **Kompatibilität mit mobilen und Touch-Geräten**.
- **Undo/Redo**: Für Markierungen.
- **Lokale Speicherung mit Backup-Möglichkeit**: Z. B. Datei-Export.

---

## 🚀 Deployment & Semantic Versioning

### Voraussetzungen

- Node.js und npm installiert
- Angular CLI installiert
- Für Webhost-Deploy: `lftp` installiert 

### Semantic Versioning

Vor jedem Deployment wird automatisch die Version gemäß [Semantic Versioning](https://semver.org/) erhöht und ein Git-Tag gesetzt.  
Das passiert durch das Skript `deploy/semantic-versioning.sh` und wird von den Deploy-Skripten automatisch ausgeführt.

### Deployment auf GitHub Pages

```sh
cd deploy
./git-pages.sh
```
- Erstellt einen Production-Build und deployed diesen auf GitHub Pages.
- Die Seite ist dann unter [https://orahpajo.github.io/mulu/](https://orahpajo.github.io/mulu/) erreichbar.

### Deployment auf eigenen Webhost (FTP)

```sh
cd deploy
./webhost.sh
```
- Erstellt einen Production-Build und lädt die Dateien per FTP nach `public_html/mulu` auf deinen Server.
- Die Zugangsdaten stehen in `deploy/credentials.txt` (Format siehe dort).
- Die Seite ist dann z. B. unter [http://mulu.marvs.net](http://mulu.marvs.net) erreichbar.


---