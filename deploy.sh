#!/usr/bin/env bash
# Jay PRODUCTION deploy — dedicated machine (project nginx on host :80).
#
# After each merge to main:
#   ./deploy.sh
#
# Domains are defined below (edit once for your prod hostnames).
# Optional override: ./deploy.sh app.example.com api.example.com
# Secrets stay in backend/.env (gitignored).
#
# For shared-EC2 development, use ./dev.sh instead.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# === Production domains (edit once; committed with the repo) ===
JAY_WEB_HOST="jay.spotynet.com"
JAY_API_HOST="jay-api.spotynet.com"

compose() {
  if docker info >/dev/null 2>&1; then
    docker compose "$@"
  elif sudo -n docker info >/dev/null 2>&1; then
    sudo docker compose "$@"
  else
    echo "Docker needs privileges. Prefer: sudo usermod -aG docker \$USER && newgrp docker" >&2
    sudo docker compose "$@"
  fi
}

if [[ "${1:-}" == "down" ]]; then
  echo "Stopping Jay PRODUCTION..."
  compose -f compose.yaml -f compose.prod.yaml down
  exit 0
fi

# Optional: ./deploy.sh <web-host> <api-host>
if [[ $# -ge 2 ]]; then
  JAY_WEB_HOST="$1"
  JAY_API_HOST="$2"
fi

export JAY_WEB_HOST JAY_API_HOST
export ALLOWED_HOSTS="localhost,127.0.0.1,${JAY_API_HOST},${JAY_WEB_HOST}"
export CSRF_TRUSTED_ORIGINS="https://${JAY_API_HOST},https://${JAY_WEB_HOST}"
export EXPO_PUBLIC_API_URL="https://${JAY_API_HOST}"

if [[ ! -f backend/.env ]]; then
  echo "Missing backend/.env — create once (SECRET_KEY, DATABASE_URL, DEBUG=False, …)." >&2
  exit 1
fi

echo "Pulling latest from git..."
git pull --ff-only

echo "Deploying Jay PRODUCTION (compose.yaml + compose.prod.yaml → :80)..."
echo "  web: ${JAY_WEB_HOST}"
echo "  api: ${JAY_API_HOST}"
compose -f compose.yaml -f compose.prod.yaml up -d --build
echo
compose -f compose.yaml -f compose.prod.yaml ps
echo
echo "PRODUCTION URLs (add TLS in front of :80 if needed):"
echo "  http://${JAY_WEB_HOST}/"
echo "  http://${JAY_API_HOST}/"
echo
echo "Logs: docker compose -f compose.yaml -f compose.prod.yaml logs -f"
echo "Stop: ./deploy.sh down"
