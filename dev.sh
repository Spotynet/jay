#!/usr/bin/env bash
# Jay DEVELOPMENT — shared EC2 / local compose (project nginx on 127.0.0.1:3010).
#
# After initial host setup (packages + sudo ./deploy/bootstrap-shared.sh once):
#   ./dev.sh
#
# Domains are defined below (not in .env). Secrets stay in backend/.env.
#
# For production, use ./deploy.sh instead.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# === Dev domains (committed; shared EC2) ===
JAY_WEB_HOST="jay-dev.spotynet.com"
JAY_API_HOST="jay-api-dev.spotynet.com"

export JAY_WEB_HOST JAY_API_HOST
export ALLOWED_HOSTS="localhost,127.0.0.1,${JAY_API_HOST},${JAY_WEB_HOST}"
export CSRF_TRUSTED_ORIGINS="https://${JAY_API_HOST},https://${JAY_WEB_HOST}"
export EXPO_PUBLIC_API_URL="https://${JAY_API_HOST}"

compose() {
  if docker info >/dev/null 2>&1; then
    docker compose "$@"
  elif sudo -n docker info >/dev/null 2>&1; then
    sudo docker compose "$@"
  else
    echo "Docker needs privileges. Prefer: sudo usermod -aG docker \$USER && newgrp docker" >&2
    echo "First-time shared host: sudo ./deploy/bootstrap-shared.sh" >&2
    sudo docker compose "$@"
  fi
}

if [[ ! -f backend/.env ]]; then
  echo "Missing backend/.env (DATABASE_URL, SECRET_KEY, …)." >&2
  exit 1
fi

pm2 delete jay-api-dev 2>/dev/null || true
pm2 delete jay-dev 2>/dev/null || true
pm2 save 2>/dev/null || true

echo "Starting Jay DEV (compose.yaml → 127.0.0.1:3010)..."
echo "  web: ${JAY_WEB_HOST}"
echo "  api: ${JAY_API_HOST}"
compose -f compose.yaml up -d --build
echo
compose -f compose.yaml ps
echo
echo "DEV URLs (via host nginx TLS):"
echo "  https://${JAY_WEB_HOST}/"
echo "  https://${JAY_API_HOST}/"
echo
echo "Logs: docker compose -f compose.yaml logs -f"
echo "Stop: docker compose -f compose.yaml down"
