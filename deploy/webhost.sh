#!/bin/bash
set -e

if [ "$1" != "prod" ] && [ "$1" != "test" ]; then
  echo "Usage: $0 [prod|test]"
  exit 1
fi

STAGE="$1"
SCRIPT_DIR="$(dirname "$0")"

if [ "$STAGE" = "prod" ]; then
  BUILD_CONFIG="prod"
  FTP_TARGET="public_html/mulu"
else
  BUILD_CONFIG="test"
  FTP_TARGET="public_html/mulu-t"
fi

ng build --configuration $BUILD_CONFIG

# move htaccess files to dist
cp "$SCRIPT_DIR/htaccess/.htaccess" dist/mulu/browser/
cp "$SCRIPT_DIR/htaccess/.htpasswd" dist/mulu/browser/
mkdir -p dist/mulu/browser/commonSongs

# read Credentials from credentials.txt
CRED_FILE="$SCRIPT_DIR/credentials.txt"
FTP_HOST=$(grep server "$CRED_FILE" | cut -d'=' -f2)
FTP_USER=$(grep user "$CRED_FILE" | cut -d'=' -f2)
FTP_PASS=$(grep password "$CRED_FILE" | cut -d'=' -f2)

echo "Uploading to $FTP_HOST with user $FTP_USER (target: $FTP_TARGET)"
lftp -c "
open -u $FTP_USER,$FTP_PASS $FTP_HOST
mirror -R -e dist/mulu/browser $FTP_TARGET
bye
"