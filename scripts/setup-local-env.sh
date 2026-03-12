#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

copy_if_missing() {
  local src="$1"
  local dst="$2"

  if [[ ! -f "$dst" ]]; then
    cp "$src" "$dst"
    echo "Created ${dst#$ROOT_DIR/} from ${src#$ROOT_DIR/}"
  else
    echo "Using existing ${dst#$ROOT_DIR/}"
  fi
}

copy_if_missing "$ROOT_DIR/apps/web/.env.example" "$ROOT_DIR/apps/web/.env.local"
copy_if_missing "$ROOT_DIR/apps/cms/.env.example" "$ROOT_DIR/apps/cms/.env"
