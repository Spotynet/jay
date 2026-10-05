#!/usr/bin/env bash
# Point both Jay host-nginx vhosts at the project Compose nginx gateway (3010).
# Usage: sudo ./deploy/apply-nginx.sh
set -euo pipefail

CONF=/etc/nginx/sites-available/spotynet-dev.conf
BAK="${CONF}.bak.$(date +%F-%H%M%S)"

if [[ $EUID -ne 0 ]]; then
  echo "Run with sudo: sudo $0" >&2
  exit 1
fi

cp -a "$CONF" "$BAK"
echo "Backup: $BAK"

python3 - "$CONF" <<'PY'
import re
import sys

path = sys.argv[1]
text = open(path, encoding="utf-8").read()

def patch_server(text: str, server_name: str, new_port: str) -> str:
    # Replace proxy_pass inside the HTTPS (or any) server block for this server_name.
    pattern = re.compile(
        rf"(server_name\s+{re.escape(server_name)}\s*;.*?proxy_pass\s+http://127\.0\.0\.1:)\d+(\s*;)",
        re.DOTALL,
    )
    new_text, n = pattern.subn(rf"\g<1>{new_port}\2", text, count=1)
    if n != 1:
        raise SystemExit(f"Expected 1 proxy_pass for {server_name}, found {n}")
    return new_text

text = patch_server(text, "jay-api-dev.spotynet.com", "3010")
text = patch_server(text, "jay-dev.spotynet.com", "3010")
open(path, "w", encoding="utf-8").write(text)
print("Updated jay-api-dev and jay-dev proxy_pass → 127.0.0.1:3010")
PY

nginx -t
systemctl reload nginx
echo "nginx reloaded OK"
echo
echo "Verify:"
echo "  curl -I -H 'Host: jay-dev.spotynet.com' http://127.0.0.1:3010/"
echo "  curl -I https://jay-dev.spotynet.com/"
echo "  curl -I https://jay-api-dev.spotynet.com/"
