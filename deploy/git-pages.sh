#!/bin/bash
set -e

ng build --configuration prod --base-href "https://orahpajo.github.io/mulu/"
npx angular-cli-ghpages --dir=dist/mulu/browser