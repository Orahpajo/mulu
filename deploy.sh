#!/bin/bash

# abbort on error
set -e

# 1. Finde den letzten Deploy-Tag (Format: deploy-vX.Y.Z)
LAST_DEPLOY_TAG=$(git tag --list "deploy-v*" --sort=-creatordate | head -n 1)
if [ -n "$LAST_DEPLOY_TAG" ]; then
  LAST_DEPLOY=$(git rev-list -n 1 "$LAST_DEPLOY_TAG")
else
  LAST_DEPLOY=
fi

# 2. Hole alle Commit-Messages seit dem letzten Deploy
if [ -z "$LAST_DEPLOY" ]; then
  COMMITS=$(git log --pretty=format:"%s")
else
  COMMITS=$(git log $LAST_DEPLOY..HEAD --pretty=format:"%s")
fi

# 3. Entscheide, welche Version erhöht werden soll
if echo "$COMMITS" | grep -qiE 'BREAKING CHANGE|^feat!|^fix!|^refactor!'; then
  BUMP="major"
elif echo "$COMMITS" | grep -qiE '^feat'; then
  BUMP="minor"
else
  BUMP="patch"
fi

# 4. Version erhöhen
npm version $BUMP --no-git-tag-version

# 5. Version in Environmenten setzen
NEW_VERSION=$(node -p "require('./package.json').version")
sed -i "s/version: '.*'/version: '$NEW_VERSION'/" src/environment/environment.ts

# 6. Build und Deploy
ng build --configuration production --base-href "https://orahpajo.github.io/mulu/"
npx angular-cli-ghpages --dir=dist/mulu/browser

# 7. Commit und Tag
git add package.json package-lock.json
git commit -m "deploy: v$NEW_VERSION"
git tag "deploy-v$NEW_VERSION"
git push
git push --tags