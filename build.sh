#!/bin/sh
set -e
cd "$(dirname "$0")"
cp ../design-system/tokens.css scss/_tokens.scss
node build/pages.js
npx --yes sass scss/main.scss styles.css --style=expanded --source-map --no-error-css
echo "Built: 9 HTML pages + compiled styles.css"
