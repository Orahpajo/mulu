#!/bin/bash

SCRIPT_DIR="$(dirname "$0")"

# Verzeichnis mit den .mulu-Dateien
SOURCE_DIR="${SCRIPT_DIR}/commonSongs"
DEST_DIR="${SCRIPT_DIR}/../public/commonSongs"

# Zielverzeichnis erstellen, falls es nicht existiert
mkdir -p "$DEST_DIR"

# Alle .mulu-Dateien im Quellverzeichnis durchlaufen
for file in "$SOURCE_DIR"/*.mulu; do
    # Dateiinhalt lesen
    content=$(cat "$file")

    # songFile extrahieren
    songFile=$(echo "$content" | jq '.songFile')
    songFileName=$(echo "$songFile" | jq -r '.name' | sed 's/[\/:*?"<>|]/_/g') # Ungültige Zeichen entfernen

    # audioFiles extrahieren
    audioFiles=$(echo "$content" | jq '.audioFiles')

    # Dateien erstellen
    if [ -n "$songFile" ] && [ -n "$songFileName" ]; then
        echo "{\"songFile\": $songFile}" > "$DEST_DIR/$songFileName.mulu"
        echo "Created: $DEST_DIR/$songFileName.mulu"
    fi

    # Für jede Audio-Datei eine eigene JSON-Datei erstellen
    echo "$audioFiles" | jq -c '.[]' | while read -r audioFile; do
        audioFileId=$(echo "$audioFile" | jq -r '.id')

        if [ -n "$audioFileId" ]; then
            echo "$audioFile" > "$DEST_DIR/$audioFileId.json"
            echo "Created: $DEST_DIR/$audioFileId.json"
        fi
    done
done