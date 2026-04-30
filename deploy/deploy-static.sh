#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_TARGET="${DEPLOY_TARGET:-/var/www/bohack.top/current}"
DEPLOY_OWNER="${DEPLOY_OWNER-www-data:www-data}"
SKIP_BUILD="${SKIP_BUILD:-0}"

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "error: missing required command: $1" >&2
    exit 1
  fi
}

run_privileged() {
  if [[ "${EUID}" -eq 0 ]]; then
    "$@"
    return
  fi

  if command -v sudo >/dev/null 2>&1; then
    sudo "$@"
    return
  fi

  "$@"
}

need_cmd npm
need_cmd rsync

if [[ "${SKIP_BUILD}" != "1" ]]; then
  echo "Building production bundle..."
  (
    cd "$ROOT_DIR"
    npm run build
  )
fi

if [[ ! -d "$ROOT_DIR/dist" ]]; then
  echo "error: dist/ not found. Run npm run build first, or leave SKIP_BUILD unset." >&2
  exit 1
fi

echo "Syncing dist/ to ${DEPLOY_TARGET}..."
run_privileged mkdir -p "$DEPLOY_TARGET"
run_privileged rsync -av --delete "$ROOT_DIR/dist/" "$DEPLOY_TARGET/"

if [[ -n "${DEPLOY_OWNER}" ]]; then
  echo "Fixing ownership to ${DEPLOY_OWNER}..."
  run_privileged chown -R "$DEPLOY_OWNER" "$DEPLOY_TARGET"
fi

echo "Deploy complete: ${DEPLOY_TARGET}"
