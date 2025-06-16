# Mulu

## 🚀 Deployment & Semantic Versioning

### Voraussetzungen

- Node.js und npm installiert
- Angular CLI installiert
- Für Webhost-Deploy: `lftp` installiert 
- Für Autocomplete: zsh (empfohlen) und ggf. jq für die Scripts

### Semantic Versioning

Vor jedem Deployment wird automatisch die Version gemäß [Semantic Versioning](https://semver.org/) erhöht und ein Git-Tag gesetzt.  
Das passiert durch das Skript `deploy/semantic-versioning.sh` und wird von den Deploy-Skripten automatisch ausgeführt.

### Deployment auf eigenen Webhost (FTP)

#### 1. Hauptanwendung deployen

```sh
./deploy/webhost.sh [prod|test]
```
- Erstellt einen Production- oder Test-Build und lädt die Dateien per FTP nach `public_html/mulu` (prod) oder `public_html/mulu-t` (test) auf deinen Server.
- Die Zugangsdaten stehen in `deploy/credentials.txt` (Format siehe dort).
- Die Seite ist dann z. B. unter [http://mulu.marvs.net](http://mulu.marvs.net) erreichbar.
- **Hinweis:** Der Ordner `public/commonSongs` wird dabei nicht automatisch mit hochgeladen!

#### 2. Gemeinsame Songdateien für den Upload vorbereiten

Die Songdateien können über die mulu app geteilt bzw. heruntergeladen werden. Dabei wird ein **.mulu** Datei zerzeugt. Diese datei dann nach `deploy/commonSongs` Kopieren. 

So können die Datein dann als commonSong extrahiert werden:

```sh
./deploy/extractCommonFiles.sh
```

Wenn man nur einzelne Dateien extrahieren möchte, kann man so vorgehen:

```sh
./deploy/extractCommonFiles.sh <dateiname>
```


#### 3. Gemeinsame Songdateien (commonSongs) hochladen

Um die Songdateien und zugehörigen Audiofiles hochzuladen, verwende:

```sh
./deploy/uploadCommonSongs.sh [Dateiname.mulu] [prod|test]
```
- Ohne Parameter werden alle `.mulu`-Dateien und die darin referenzierten Audiofile-JSONs aus `public/commonSongs` hochgeladen.
- Mit Dateinamen (z.B. `I_5 Tratsch.mulu`) wird nur diese Datei und die zugehörigen Audiofiles hochgeladen.
- Der zweite Parameter bestimmt das Ziel (`prod` = Hauptseite, sonst Testumgebung).

### Autocomplete für die Deploy-Skripte (zsh)

Damit du Dateinamen beim Aufruf von `extraxtCommonFiles.sh` und `uploadCommonSongs.sh` bequem mit Tab vervollständigen kannst:

1. Stelle sicher, dass du zsh verwendest (Standard auf macOS). Prüfe ggf. mit `echo $SHELL`.
2. Füge in deine `~/.zshrc` (falls nicht vorhanden):
   ```sh
   autoload -Uz compinit && compinit
   ```
   und starte ein neues Terminal oder führe `source ~/.zshrc` aus.
3. Lade das Autocomplete-Skript:
   ```sh
   source ./deploy/_deploy-autocomplete
   ```
   (Pfad ggf. anpassen)
4. Jetzt kannst du z.B. schreiben:
   ```sh
   ./deploy/uploadCommonSongs.sh <TAB>
   ./deploy/extraxtCommonFiles.sh <TAB>
   ```
   und bekommst alle verfügbaren `.mulu`-Dateien zur Auswahl.

### Deployment auf GitHub Pages

Nur zu Testzwecken. Eigentlich nicht mehr nötig.

```sh
cd deploy
./git-pages.sh
```
- Erstellt einen Production-Build und deployed diesen auf GitHub Pages.
- Die Seite ist dann unter [https://orahpajo.github.io/mulu/](https://orahpajo.github.io/mulu/) erreichbar.
