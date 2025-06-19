#!/bin/bash
set -e

SCRIPT_DIR="$(dirname "$0")"
PUBLIC_COMMONSONGS="$SCRIPT_DIR/../public/commonSongs"
CRED_FILE="$SCRIPT_DIR/credentials.txt"

if [ ! -f "$CRED_FILE" ]; then
  echo "credentials.txt nicht gefunden!"
  exit 1
fi

FTP_HOST=$(grep server "$CRED_FILE" | cut -d'=' -f2)
FTP_USER=$(grep user "$CRED_FILE" | cut -d'=' -f2)
FTP_PASS=$(grep password "$CRED_FILE" | cut -d'=' -f2)

# Zielverzeichnis wie in webhost.sh bestimmen
if [ "$2" = "prod" ]; then
  FTP_TARGET="public_html/mulu/commonSongs"
else
  FTP_TARGET="public_html/mulu-t/commonSongs"
fi

# Funktion zum Hochladen einer mulu-Datei und ihrer Audiofiles
upload_mulu_and_audiofiles() {
  local mulu_file="$1"
if [ ! -f "$mulu_file" ]; then
    echo "Warnung: $mulu_file nicht gefunden, wird übersprungen."
    return
fi
  echo "Uploading $mulu_file to $FTP_HOST:$FTP_TARGET ..."
  lftp -c "open -u $FTP_USER,$FTP_PASS $FTP_HOST; mkdir -p $FTP_TARGET; put -O $FTP_TARGET '$mulu_file'; bye"

  # IDs der Audiofiles extrahieren und zugehörige JSON hochladen
  local ids=$(jq -r '.songFile.audiofiles[].id' "$mulu_file" 2>/dev/null)
  for id in $ids; do
    local json_file="$PUBLIC_COMMONSONGS/$id.json"
    if [ -f "$json_file" ]; then
      echo "Uploading $json_file to $FTP_HOST:$FTP_TARGET ..."
      lftp -c "open -u $FTP_USER,$FTP_PASS $FTP_HOST; mkdir -p $FTP_TARGET; put -O $FTP_TARGET '$json_file'; bye"
    else
      echo "Warnung: $json_file nicht gefunden, wird übersprungen."
    fi
  done
}

if [ -n "$1" ]; then
  upload_mulu_and_audiofiles "$PUBLIC_COMMONSONGS/$1"
else
  for mulu_file in "$PUBLIC_COMMONSONGS"/*.mulu; do
    upload_mulu_and_audiofiles "$mulu_file"
  done
fi
