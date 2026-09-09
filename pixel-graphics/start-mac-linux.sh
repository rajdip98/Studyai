#!/usr/bin/env bash
# Double-click this file (or run ./start-mac-linux.sh) to start the site.

cd "$(dirname "$0")/server" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo
  echo "Node.js is not installed."
  echo "Install it from https://nodejs.org (pick the \"LTS\" button), then run this again."
  echo
  read -r -p "Press Enter to close..."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Setting up for the first time. This takes a minute..."
  npm install --no-audit --no-fund
fi

echo
echo "Starting Pixel Graphics..."
echo
echo "  Website:     http://localhost:3000"
echo "  Admin panel: http://localhost:3000/admin.html"
echo
echo "Keep this window open while you use the site. Press Ctrl+C to stop."
echo

(sleep 2 && (open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null)) &

node server.js
