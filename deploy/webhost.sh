#!/bin/bash
set -e

SCRIPT_DIR="$(dirname "$0")"

ng build --configuration production

# move htaccess files to dist
cp "$SCRIPT_DIR/htaccess/.htaccess" dist/mulu/browser/
cp "$SCRIPT_DIR/htaccess/.htpasswd" dist/mulu/browser/
mkdir -p dist/mulu/browser/commonSongs
cp -r "public/commonSongs/" dist/mulu/browser/commonSongs/

# read Credentials from credentials.txt
CRED_FILE="$SCRIPT_DIR/credentials.txt"
FTP_HOST=$(grep server "$CRED_FILE" | cut -d'=' -f2)
FTP_USER=$(grep user "$CRED_FILE" | cut -d'=' -f2)
FTP_PASS=$(grep password "$CRED_FILE" | cut -d'=' -f2)

echo "Uploading to $FTP_HOST with user $FTP_USER"
lftp -c "
open -u $FTP_USER,$FTP_PASS $FTP_HOST
mirror -R -e dist/mulu/browser public_html/mulu
bye
"