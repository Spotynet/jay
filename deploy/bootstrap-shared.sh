#!/usr/bin/env bash
# One-shot shared-EC2 bootstrap for Jay (requires sudo password once).
# - Points host nginx Jay vhosts at 127.0.0.1:3010
# - Updates setup.txt Jay section notes
# - Starts the Compose stack
#
# Usage: sudo ./deploy/bootstrap-shared.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONF=/etc/nginx/sites-available/spotynet-dev.conf
SETUP=/home/spotynet/projects/apps/setup.txt

if [[ $EUID -ne 0 ]]; then
  echo "Run with sudo: sudo $0" >&2
  exit 1
fi

# Prefer the invoking user for file ownership / compose project dir
RUN_USER="${SUDO_USER:-spotynet}"

echo "==> Applying host nginx Jay gateway (3010)"
bash "$ROOT/deploy/apply-nginx.sh"

if [[ -f "$SETUP" ]]; then
  echo "==> Updating setup.txt Jay port map notes"
  BAK="${SETUP}.bak.$(date +%F-%H%M%S)"
  cp -a "$SETUP" "$BAK"
  python3 - "$SETUP" <<'PY'
from pathlib import Path
import re
import sys

path = Path(sys.argv[1])
text = path.read_text(encoding="utf-8")

new_map = """JAY (Docker Compose — per-project nginx)
- Start: cd /home/spotynet/projects/apps/jay && ./dev.sh
- Project nginx gateway (host bind): 127.0.0.1:3010 → container :80
- API (Compose service api, internal): 3012 — domain jay-api-dev.spotynet.com
- Expo mobile web (Compose service mobile, internal): 3011 — domain jay-dev.spotynet.com
- Host nginx proxies BOTH Jay domains to http://127.0.0.1:3010 (Host header selects upstream)
- Release: ./build.sh (ECR) then on prod ./deploy.sh (pull only)
- Apply/fix host nginx for Jay: sudo ./deploy/apply-nginx.sh
"""

text2, n = re.subn(
    r"JAY\n- API PM2 name: jay-api-dev\n- API port: 3012\n- API domain: jay-api-dev\.spotynet\.com\n- Expo mobile web PM2 name: jay-dev\n- Expo mobile web port: 3011\n- Expo mobile web domain: jay-dev\.spotynet\.com\n",
    new_map + "\n",
    text,
    count=1,
)
if n == 0 and "Project nginx gateway" not in text:
    # Already migrated compose notes, or different formatting — try broader replace
    text2, n = re.subn(
        r"JAY\n(?:- .+\n)+",
        new_map + "\n",
        text,
        count=1,
    )

text = text2

# Template HTTP blocks in setup.txt (reconstruction guide)
text = text.replace(
    "proxy_pass http://127.0.0.1:3011;",
    "proxy_pass http://127.0.0.1:3010;",
)
text = text.replace(
    "proxy_pass http://127.0.0.1:3012;",
    "proxy_pass http://127.0.0.1:3010;",
)

# PM2 start section → Compose
old_start = """JAY
---

  cd /home/spotynet/projects/apps/jay
  pm2 delete jay-api-dev 2>/dev/null || true
  pm2 delete jay-dev 2>/dev/null || true

  pm2 start backend/venv/bin/python --name jay-api-dev --cwd backend -- manage.py runserver 127.0.0.1:3012
  pm2 start bash --name jay-dev --cwd mobile -- -c "npx expo start --web --port 3011 --host localhost"
"""
new_start = """JAY
---

  cd /home/spotynet/projects/apps/jay
  pm2 delete jay-api-dev 2>/dev/null || true
  pm2 delete jay-dev 2>/dev/null || true
  pm2 save 2>/dev/null || true

  ./dev.sh
  # First time / after gateway port change:
  #   sudo ./deploy/apply-nginx.sh
  # Prod (dedicated machine): ./build.sh on builder, then ./deploy.sh on prod
"""
if old_start in text:
    text = text.replace(old_start, new_start)

text = text.replace(
    ":(3001|3002|3003|3004|3005|3006|3007|3008|3009|3011|3012|3013)",
    ":(3001|3002|3003|3004|3005|3006|3007|3008|3009|3010|3011|3012|3013)",
)

path.write_text(text, encoding="utf-8")
print(f"Updated {path}")
PY
fi

echo "==> Starting Docker Compose as ${RUN_USER}"
cd "$ROOT"
# Ensure docker group membership for future non-sudo use (takes effect on next login)
usermod -aG docker "$RUN_USER" 2>/dev/null || true

if id -nG "$RUN_USER" | grep -qw docker; then
  runuser -u "$RUN_USER" -- docker compose up -d --build
else
  # Current shell may not have docker group yet
  docker compose up -d --build
  chown -R "$RUN_USER:$RUN_USER" "$ROOT" 2>/dev/null || true
fi

echo
echo "==> Status"
docker compose ps
echo
echo "Local gateway checks:"
echo "  curl -I -H 'Host: jay-dev.spotynet.com' http://127.0.0.1:3010/"
echo "  curl -I -H 'Host: jay-api-dev.spotynet.com' http://127.0.0.1:3010/"
echo "Public:"
echo "  curl -I https://jay-dev.spotynet.com/"
echo "  curl -I https://jay-api-dev.spotynet.com/"
echo
echo "Note: if docker group was just added for ${RUN_USER}, re-login (or newgrp docker) for passwordless docker."
