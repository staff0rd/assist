#!/usr/bin/env bash
# Regenerates the iOS app icon from extension/icons/assist-master.png: the master is centred on
# the slate dark background (App Store icons must be opaque) and written as a 1024x1024 PNG with no alpha.
# Requires ImageMagick 7 (`brew install imagemagick`).
set -euo pipefail

BACKGROUND="${BACKGROUND:-#0e1116}"
ART_SIZE="${ART_SIZE:-780}"

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
master="$root/extension/icons/assist-master.png"
out="$root/ios-app/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"

magick -size 1024x1024 "xc:$BACKGROUND" \
  \( "$master" -resize "${ART_SIZE}x${ART_SIZE}" \) \
  -gravity center -composite \
  -alpha off -strip "PNG24:$out"

echo "Wrote $out"
